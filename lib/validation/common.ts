export interface ValidationResponse {
  valid: boolean;
  errors: string[];
}

export function required(
  value: unknown,
  fieldName: string
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return `${fieldName} is required.`;
  }

  return null;
}


export function minLength(
  value: string,
  length: number,
  fieldName: string
) {
  if (value.length < length) {
    return `${fieldName} must be at least ${length} characters.`;
  }

  return null;
}


export function maxLength(
  value: string,
  length: number,
  fieldName: string
) {
  if (value.length > length) {
    return `${fieldName} must not exceed ${length} characters.`;
  }

  return null;
}


export function isEmail(
  value: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}


export function validateEmail(
  value: string,
  fieldName = "Email"
) {
  if (!isEmail(value)) {
    return `${fieldName} is invalid.`;
  }

  return null;
}


export function isUrl(
  value: string
) {
  try {
    new URL(value);

    return true;
  } catch {
    return false;
  }
}


export function validateUrl(
  value: string,
  fieldName = "URL"
) {
  if (!isUrl(value)) {
    return `${fieldName} is invalid.`;
  }

  return null;
}


export function isPhone(
  value: string
) {
  return /^[+]?[0-9\s\-()]{7,20}$/.test(
    value
  );
}


export function validatePhone(
  value: string,
  fieldName = "Phone"
) {
  if (!isPhone(value)) {
    return `${fieldName} is invalid.`;
  }

  return null;
}


export function collectErrors(
  errors: Array<string | null>
): ValidationResponse {
  const messages =
    errors.filter(
      Boolean
    ) as string[];

  return {
    valid:
      messages.length === 0,

    errors:
      messages,
  };
}