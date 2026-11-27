export { login } from "./login.controller";
export { register } from "./register.controller";
export {
  sendOtpController,
  verifyOtpController,
  resetPasswordController,
} from "./forgot-password.controller";
export {
  googleAuthRedirect,
  googleAuthCallback,
  linkedinAuthRedirect,
  linkedinAuthCallback,
} from "./oauth.controller";
export { adminLogin } from "./admin.controller";
