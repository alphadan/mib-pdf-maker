// Official 1-to-67 alphabetical County FIPS/Index mapping for the Commonwealth of Pennsylvania
export const PA_COUNTIES_DICT: Record<string, string> = {
  "01": "Adams", "1": "Adams",
  "02": "Allegheny", "2": "Allegheny",
  "03": "Armstrong", "3": "Armstrong",
  "04": "Beaver", "4": "Beaver",
  "05": "Bedford", "5": "Bedford",
  "06": "Berks", "6": "Berks",
  "07": "Blair", "7": "Blair",
  "08": "Bradford", "8": "Bradford",
  "09": "Bucks", "9": "Bucks",
  "10": "Butler",
  "11": "Cambria",
  "12": "Cameron",
  "13": "Carbon",
  "14": "Centre",
  "15": "Chester",
  "16": "Clarion",
  "17": "Clearfield",
  "18": "Clinton",
  "19": "Columbia",
  "20": "Crawford",
  "21": "Cumberland",
  "22": "Dauphin",
  "23": "Delaware",
  "24": "Elk",
  "25": "Erie",
  "26": "Fayette",
  "27": "Forest",
  "28": "Franklin",
  "29": "Fulton",
  "30": "Greene",
  "31": "Huntingdon",
  "32": "Indiana",
  "33": "Jefferson",
  "34": "Juniata",
  "35": "Lackawanna",
  "36": "Lancaster",
  "37": "Lawrence",
  "38": "Lebanon",
  "39": "Lehigh",
  "40": "Luzerne",
  "41": "Lycoming",
  "42": "McKean",
  "43": "Mercer",
  "44": "Mifflin",
  "45": "Monroe",
  "46": "Montgomery",
  "47": "Montour",
  "48": "Northampton",
  "49": "Northumberland",
  "50": "Perry",
  "51": "Philadelphia",
  "52": "Pike",
  "53": "Potter",
  "54": "Schuylkill",
  "55": "Snyder",
  "56": "Somerset",
  "57": "Sullivan",
  "58": "Susquehanna",
  "59": "Tioga",
  "60": "Union",
  "61": "Venango",
  "62": "Warren",
  "63": "Washington",
  "64": "Wayne",
  "65": "Westmoreland",
  "66": "Wyoming",
  "67": "York"
};

// Common municipality lookup map
export const PA_MUNICIPALITIES_DICT: Record<string, string> = {
  // Chester County Municipalities
  "0920": "West Chester Borough",
  "920": "West Chester Borough",
  "0482": "Atglen Borough",
  "482": "Atglen Borough",

  // Montgomery County Municipalities
  "0810": "Norristown Borough",
  "810": "Norristown Borough",

  // Berks County Municipalities
  "1110": "Reading City",
  "111": "Reading City",

  // Delaware County Municipalities
  "1220": "Media Borough",
  "122": "Media Borough",
};

/**
 * Resolves a county string or number to its clean PA County Name.
 * If not found in the dictionary, returns the original trimmed value.
 */
export const resolveCounty = (val: any): string => {
  if (val === null || val === undefined) return "";
  const cleanVal = String(val).trim();
  // Pad single digits if necessary (e.g. "6" -> "06")
  let paddedVal = cleanVal;
  if (/^\d$/.test(cleanVal)) {
    paddedVal = "0" + cleanVal;
  }
  return PA_COUNTIES_DICT[paddedVal] || PA_COUNTIES_DICT[cleanVal] || cleanVal;
};

/**
 * Resolves a municipality code number to its legal municipality name string.
 * Returns the original trimmed value if not found in the dictionary.
 */
export const resolveMunicipality = (val: any): string => {
  if (val === null || val === undefined) return "";
  const cleanVal = String(val).trim();
  let paddedVal = cleanVal;
  if (/^\d{3}$/.test(cleanVal)) {
    paddedVal = "0" + cleanVal;
  }
  return PA_MUNICIPALITIES_DICT[paddedVal] || PA_MUNICIPALITIES_DICT[cleanVal] || cleanVal;
};
