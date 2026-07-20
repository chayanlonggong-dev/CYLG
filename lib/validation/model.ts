export interface ModelValidationInput {
  level: string;
  number: number;
  age: number;
  height: number;
  weight: number;
  city: string;
  nationality: string;
  avatar: string;
  introduction: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateModel(
  data: ModelValidationInput
): ValidationResult {
  const errors: string[] = [];

  if (!data.level.trim()) {
    errors.push("Level is required.");
  }

  if (!Number.isInteger(data.number) || data.number < 1) {
    errors.push("Model number is invalid.");
  }

  if (data.age < 18 || data.age > 99) {
    errors.push("Age must be between 18 and 99.");
  }

  if (data.height < 100 || data.height > 250) {
    errors.push("Height is invalid.");
  }

  if (data.weight < 30 || data.weight > 200) {
    errors.push("Weight is invalid.");
  }

  if (!data.city.trim()) {
    errors.push("City is required.");
  }

  if (!data.nationality.trim()) {
    errors.push("Nationality is required.");
  }

  if (!data.avatar.trim()) {
    errors.push("Avatar is required.");
  }

  if (!data.introduction.trim()) {
    errors.push("Introduction is required.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}