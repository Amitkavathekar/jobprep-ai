import { UserModel } from "../users/user.model";
import { generateToken } from "../../shared/utils/jwt.utils";
import { BadRequestError } from "../../errors/BadRequestError";

// Helper function to find or create OAuth user in database
async function findOrCreateOAuthUser(data: {
  email: string;
  fullName: string;
  avatarUrl?: string;
  provider: "google" | "linkedin";
  providerId: string;
}) {
  let user = await UserModel.findOne({
    $or: [{ email: data.email }, { providerId: data.providerId, provider: data.provider }],
  });

  if (!user) {
    user = await UserModel.create({
      fullName: data.fullName,
      email: data.email,
      avatarUrl: data.avatarUrl,
      provider: data.provider,
      providerId: data.providerId,
    });
  } else if (!user.providerId) {
    // Link existing account with OAuth provider if signed up via email previously
    user.provider = data.provider;
    user.providerId = data.providerId;
    if (data.avatarUrl && !user.avatarUrl) {
      user.avatarUrl = data.avatarUrl;
    }
    await user.save();
  }

  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    role: "user",
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: "user",
    },
  };
}

// ------------------- GOOGLE OAUTH -------------------
export const getGoogleAuthUrl = (): string => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

  if (!clientId) {
    throw new BadRequestError("GOOGLE_CLIENT_ID is not configured in backend .env");
  }

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options).toString();
  return `${rootUrl}?${qs}`;
};

export const handleGoogleCallback = async (code: string) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

  if (!clientId || !clientSecret) {
    throw new BadRequestError("Google OAuth credentials missing in backend environment");
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData: any = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new BadRequestError(tokenData.error_description || "Failed to retrieve access token from Google");
  }

  // Fetch Google User Profile
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const profile: any = await profileRes.json();
  if (!profileRes.ok || !profile.email) {
    throw new BadRequestError("Failed to fetch user profile from Google");
  }

  return findOrCreateOAuthUser({
    email: profile.email.toLowerCase(),
    fullName: profile.name || profile.given_name || "Google User",
    avatarUrl: profile.picture,
    provider: "google",
    providerId: profile.id,
  });
};

// ------------------- LINKEDIN OAUTH -------------------
export const getLinkedinAuthUrl = (): string => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_CALLBACK_URL || "http://localhost:5000/api/auth/linkedin/callback";

  if (!clientId) {
    throw new BadRequestError("LINKEDIN_CLIENT_ID is not configured in backend .env");
  }

  const rootUrl = "https://www.linkedin.com/oauth/v2/authorization";
  const options = {
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid profile email",
  };

  const qs = new URLSearchParams(options).toString();
  return `${rootUrl}?${qs}`;
};

export const handleLinkedinCallback = async (code: string) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_CALLBACK_URL || "http://localhost:5000/api/auth/linkedin/callback";

  if (!clientId || !clientSecret) {
    throw new BadRequestError("LinkedIn OAuth credentials missing in backend environment");
  }

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData: any = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new BadRequestError(tokenData.error_description || "Failed to retrieve access token from LinkedIn");
  }

  // Fetch OpenID user info from LinkedIn
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const profile: any = await profileRes.json();
  if (!profileRes.ok || !profile.email) {
    throw new BadRequestError("Failed to fetch user profile from LinkedIn");
  }

  return findOrCreateOAuthUser({
    email: profile.email.toLowerCase(),
    fullName: profile.name || `${profile.given_name || ""} ${profile.family_name || ""}`.trim() || "LinkedIn User",
    avatarUrl: profile.picture,
    provider: "linkedin",
    providerId: profile.sub,
  });
};
