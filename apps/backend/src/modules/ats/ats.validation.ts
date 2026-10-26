
export function validateATSRequest(
  targetJobRole: unknown,
): string {
  if (typeof targetJobRole !== "string") {
    throw new Error("Please enter a target job role.");
  }

  const role = targetJobRole.trim();

  if (role.length < 2) {
    throw new Error("Target job role must contain at least 2 characters.");
  }


  return role;
}
