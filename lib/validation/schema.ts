import {
  collectErrors,
  required,
  minLength,
  maxLength,
  validateEmail,
  validatePhone,
  type ValidationResponse,
} from "./common";


export function validateContactForm(
  data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }
): ValidationResponse {
  return collectErrors([
    required(
      data.name,
      "Name"
    ),

    minLength(
      data.name,
      2,
      "Name"
    ),

    required(
      data.email,
      "Email"
    ),

    validateEmail(
      data.email
    ),

    data.phone
      ? validatePhone(
          data.phone
        )
      : null,

    required(
      data.message,
      "Message"
    ),

    minLength(
      data.message,
      10,
      "Message"
    ),
  ]);
}


export function validateAdminLogin(
  data: {
    username: string;
    password: string;
  }
): ValidationResponse {
  return collectErrors([
    required(
      data.username,
      "Username"
    ),

    minLength(
      data.username,
      3,
      "Username"
    ),

    required(
      data.password,
      "Password"
    ),

    minLength(
      data.password,
      8,
      "Password"
    ),
  ]);
}


export function validateUpload(
  data: {
    filename: string;
    size: number;
    mimeType: string;
  }
): ValidationResponse {
  const maxSize =
    50 * 1024 * 1024;

  return collectErrors([
    required(
      data.filename,
      "Filename"
    ),

    data.size > maxSize
      ? "File size exceeds limit."
      : null,

    !data.mimeType
      ? "File type is required."
      : null,
  ]);
}


export function validatePagination(
  data: {
    page: number;
    limit: number;
  }
): ValidationResponse {
  return collectErrors([
    data.page < 1
      ? "Page must be greater than 0."
      : null,

    data.limit < 1
      ? "Limit must be greater than 0."
      : null,

    data.limit > 100
      ? "Limit cannot exceed 100."
      : null,
  ]);
}