
export function validateATSRequest(
  targetJobRole: unknown,
): string {
  if (typeof targetJobRole === "string" && targetJobRole.trim().length >= 2) {
    return targetJobRole.trim();
  }

  return "Target Role Application";
}
