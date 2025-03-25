
/**
 * Generates a 6-digit numerical ID from a UUID
 * @param uuid The UUID to convert
 * @returns A 6-digit string number
 */
export const getShortenedId = (uuid: string | null | undefined): string => {
  if (!uuid) return "------";
  
  // Take first 6 characters of the UUID and convert to a number
  const numericOnly = uuid.replace(/[^0-9]/g, '');
  const shortened = numericOnly.slice(0, 6).padStart(6, '0');
  return shortened;
};
