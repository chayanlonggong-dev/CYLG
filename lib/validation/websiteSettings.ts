export interface WebsiteSettingsValidationInput {
  siteName: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  signal?: string;
  line?: string;
  wechat?: string;
}

export interface WebsiteSettingsValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateWebsiteSettings(
  data: WebsiteSettingsValidationInput
): WebsiteSettingsValidationResult {
  const errors: string[] = [];

  if (!data.siteName.trim()) {
    errors.push("Website name is required.");
  }

  if (
    data.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  ) {
    errors.push("Invalid email address.");
  }

  const contactFields = [
    data.whatsapp,
    data.telegram,
    data.signal,
    data.line,
    data.wechat,
  ];

  const hasContact = contactFields.some(
    (value) => value && value.trim().length > 0
  );

  if (!hasContact) {
    errors.push(
      "At least one contact method is required."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}