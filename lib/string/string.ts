export function capitalize(
  value: string
) {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

export function truncate(
  value: string,
  length: number
) {
  if (value.length <= length) {
    return value;
  }

  return (
    value.slice(0, length) +
    "..."
  );
}

export function removeWhitespace(
  value: string
) {
  return value.replace(/\s+/g, "");
}

export function slugifyString(
  value: string
) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function randomString(
  length = 12
) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[
      Math.floor(
        Math.random() * chars.length
      )
    ];
  }

  return result;
}

export function contains(
  value: string,
  search: string
) {
  return value
    .toLowerCase()
    .includes(search.toLowerCase());
}

export function maskEmail(
  email: string
) {
  const [name, domain] =
    email.split("@");

  if (!name || !domain) {
    return email;
  }

  const visible =
    name.length > 2
      ? name.slice(0, 2)
      : name.slice(0, 1);

  return `${visible}***@${domain}`;
}

export function maskPhone(
  phone: string
) {
  if (phone.length <= 4) {
    return phone;
  }

  return (
    "*".repeat(
      phone.length - 4
    ) +
    phone.slice(-4)
  );
}