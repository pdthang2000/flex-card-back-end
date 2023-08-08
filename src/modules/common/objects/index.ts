export const allTeacherRecruitmentRelation = {
  educationBackground: true,
  jobExperience: true,
  teachingOverview: true,
  teachingCertificate: true,
  applicationReview: true,
};

export const ERROR_CODE = {
  INTERNAL_SERVER_ERROR: 3000,
  AUTHORIZATION_NOT_FOUND: 3001,
  TOKEN_VALID: 3002,
  PERMISSIONS_INVALID: 3003,
  CONFLICT: 3004,
  NOT_FOUND: 3005,
  ONECLUBID_NOT_FOUND: 3006,
  STORAGE_ERROR: 3007,
  THIRD_PARTY_ERROR: 3008,
  EMAIL_NOT_FOUND: 3009,
};

export const ERROR_MESSAGES = {
  [ERROR_CODE.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [ERROR_CODE.AUTHORIZATION_NOT_FOUND]: 'Authorization not found',
  [ERROR_CODE.TOKEN_VALID]: 'Token not valid',
  [ERROR_CODE.PERMISSIONS_INVALID]: 'Permissions invalid',
  [ERROR_CODE.CONFLICT]: 'Conflict',
  [ERROR_CODE.NOT_FOUND]: 'Resource not found',
  [ERROR_CODE.ONECLUBID_NOT_FOUND]: 'oneClubId not found',
  [ERROR_CODE.STORAGE_ERROR]: 'Storage error',
  [ERROR_CODE.THIRD_PARTY_ERROR]: 'Third party error',
  [ERROR_CODE.EMAIL_NOT_FOUND]: 'Email not found',
};
