/**
 * Chester County Municipality Code to Name Lookup Dictionary
 *
 * Maps Chester County municipal routing numbers to their official text names.
 */
export const MUNICIPALITY_LOOKUP: Record<string, string> = {
  "1": "ATGLEN",
  "21": "EAST FALLOWFIELD TWP",
  "22": "WEST FALLOWFIELD TWP",
  "26": "HIGHLAND TWP",
  "48": "PARKESBURG",
  "55": "SADSBURY TWP",
  "56": "WEST SADSBURY TWP",
};

/**
 * Looks up a municipality name by its numeric code.
 *
 * @param code - The numeric code as a string or number (e.g. "21" or 56)
 * @returns The official full name of the municipality, or the original code if not found
 */
export const lookupMunicipality = (code: string | number | null | undefined): string => {
  if (code === null || code === undefined) return "";
  const sanitized = String(code).trim();
  return MUNICIPALITY_LOOKUP[sanitized] || sanitized;
};
