export function validateUpdateName(value: string, field: "firstName" | "lastName"): string {
  const text = value.trim();

  if (text.length < 2) {
    throw { status: 400, message: `${field} too short` }
  }

  if (text.length > 30) {
    throw { status: 400, message: `${field} too long` }
  }

  return text;
}
