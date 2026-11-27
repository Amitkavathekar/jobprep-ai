export { loginUser } from "./login.service";
export { registerUser } from "./register.service";
export {
  sendResetPasswordOtp,
  verifyResetOtp,
  resetPassword,
} from "./forgot-password.service";
export {
  getGoogleAuthUrl,
  handleGoogleCallback,
  getLinkedinAuthUrl,
  handleLinkedinCallback,
} from "./oauth.service";
export { loginAdmin } from "./admin.service";
