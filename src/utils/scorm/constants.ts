export const SCORM_ERROR_CODES = {
  NO_ERROR: "0",
  GENERAL_INIT_FAILURE: "101",
  INVALID_ARGUMENT: "201",
  NOT_INITIALIZED: "301",
  NOT_IMPLEMENTED: "401",
  INVALID_SET_VALUE: "402",
  READ_ONLY_ELEMENT: "403",
  WRITE_ONLY_ELEMENT: "404",
  INCORRECT_DATA_TYPE: "405",
} as const;

export const ERROR_MESSAGES = {
  [SCORM_ERROR_CODES.NO_ERROR]: "No error",
  [SCORM_ERROR_CODES.GENERAL_INIT_FAILURE]: "General initialization failure",
  [SCORM_ERROR_CODES.INVALID_ARGUMENT]: "Invalid argument error",
  [SCORM_ERROR_CODES.NOT_INITIALIZED]: "Not initialized",
  [SCORM_ERROR_CODES.NOT_IMPLEMENTED]: "Not implemented error",
  [SCORM_ERROR_CODES.INVALID_SET_VALUE]: "Invalid set value, element is a keyword",
  [SCORM_ERROR_CODES.READ_ONLY_ELEMENT]: "Element is read only",
  [SCORM_ERROR_CODES.WRITE_ONLY_ELEMENT]: "Element is write only",
  [SCORM_ERROR_CODES.INCORRECT_DATA_TYPE]: "Incorrect data type",
} as const;