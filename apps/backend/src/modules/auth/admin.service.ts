import { UnauthorizedError } from "../../errors/UnauthorizedError";

export const loginAdmin = async (data: { email: string; password: string }) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (data.email.trim().toLowerCase() !== adminEmail?.toLowerCase()) {
    throw new UnauthorizedError("Invalid admin email or password");
  }

  if (data.password !== adminPassword) {
    throw new UnauthorizedError("Invalid admin email or password");
  }

  return {
    email: adminEmail,
    message: "Admin login successful",
  };
};
