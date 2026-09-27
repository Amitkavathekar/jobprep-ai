export const RESPONSE_MESSAGES = {
  // Auth
  SUCCESS_LOGIN: 'User logged in successfully.',
  SUCCESS_REGISTER: 'User registered successfully.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  UNAUTHORIZED: 'Unauthorized access. Token missing or invalid.',
  FORBIDDEN: 'Access denied. You do not have permission for this resource.',
  TOKEN_EXPIRED: 'Token expired. Please login again.',
  EMAIL_ALREADY_EXISTS: 'User with this email already exists.',

  // Users
  USER_NOT_FOUND: 'User not found.',
  USER_PROFILE_UPDATED: 'Profile updated successfully.',

  // ATS
  ATS_ANALYSIS_SUCCESS: 'ATS Resume analysis completed successfully.',
  ATS_REPORT_NOT_FOUND: 'ATS report not found.',

  // Mock Interview
  MOCK_QUESTIONS_GENERATED: 'Interview questions generated successfully.',
  MOCK_EVALUATION_SUCCESS: 'Interview answer evaluated successfully.',
  MOCK_SESSION_NOT_FOUND: 'Mock interview session not found.',

  // Resume
  RESUME_CREATED: 'Resume created successfully.',
  RESUME_UPDATED: 'Resume updated successfully.',
  RESUME_DELETED: 'Resume deleted successfully.',
  RESUME_NOT_FOUND: 'Resume not found.',

  // General
  SERVER_ERROR: 'Internal server error occurred.',
  RESOURCE_NOT_FOUND: 'Requested resource not found.',
  VALIDATION_ERROR: 'Request validation failed.',
} as const;
