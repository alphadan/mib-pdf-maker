export interface AppFieldSchema {
  headerName: string;
  type: "string" | "string[]";
  isNullable: boolean;
  description: string;
  requirementLevel: "universal" | "reason-specific" | "optional";
  requiredForReasons?: string[]; // Triggers validation ONLY if activeTab is in this list
}

export const DYNAMIC_CSV_SCHEMA: Record<string, AppFieldSchema> = {
  First_Name: {
    headerName: "First_Name",
    requirementLevel: "universal",
    type: "string",
    isNullable: true,
    description: "First name of the voter",
  },
  Middle_Name: {
    headerName: "Middle_Name",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Middle name or initial of the voter",
  },
  Last_Name: {
    headerName: "Last_Name",
    requirementLevel: "universal",
    type: "string",
    isNullable: true,
    description: "Last name of the voter",
  },
  Suffix: {
    headerName: "Suffix",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Suffix of the voter (e.g. JR, SR, III, IV)",
  },
  Date_Of_Birth: {
    headerName: "Date_Of_Birth",
    requirementLevel: "universal",
    type: "string",
    isNullable: true,
    description: "Birthdate of the voter (MM/DD/YYYY)",
  },
  House__: {
    headerName: "House__",
    requirementLevel: "universal",
    type: "string",
    isNullable: true,
    description: "House number of the voter's residence",
  },
  StreetNameComplete: {
    headerName: "StreetNameComplete",
    requirementLevel: "universal",
    type: "string",
    isNullable: true,
    description: "Street name of the voter's residence",
  },
  Apt__: {
    headerName: "Apt__",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Apartment, suite, or room number of the voter",
  },
  City: {
    headerName: "City",
    requirementLevel: "universal",
    type: "string",
    isNullable: true,
    description: "City or town of residence",
  },
  State: {
    headerName: "State",
    requirementLevel: "universal",
    type: "string",
    isNullable: true,
    description: "State abbreviation (e.g., PA)",
  },
  Zip_Code: {
    headerName: "Zip_Code",
    requirementLevel: "universal",
    type: "string",
    isNullable: true,
    description: "ZIP code of residence",
  },
  MAddress_Line_1: {
    headerName: "MAddress_Line_1",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Optional mailing address line 1 (if different from residence)",
  },
  MAddress_Line_2: {
    headerName: "MAddress_Line_2",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Optional mailing address line 2",
  },
  MCity: {
    headerName: "MCity",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Mailing city (if different from residence)",
  },
  MState: {
    headerName: "MState",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Mailing state (if different from residence)",
  },
  MZip_Code: {
    headerName: "MZip_Code",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Mailing ZIP code (if different from residence)",
  },
  Ward: {
    headerName: "Ward",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Optional Ward number",
  },
  "RNCfiles.PrimaryPhone": {
    headerName: "RNCfiles.PrimaryPhone",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Optional primary telephone number",
  },
  Voter_Status: {
    headerName: "Voter_Status",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Optional voter registration status (Active/Inactive)",
  },
  Precinct: {
    headerName: "Precinct",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Optional Precinct or voting district identifier",
  },
  "RNCfiles.OfficialParty": {
    headerName: "RNCfiles.OfficialParty",
    requirementLevel: "reason-specific",
    requiredForReasons: ["new-registration", "party-change"],
    type: "string",
    isNullable: true,
    description: "Party selection (Required for new registrations or party changes)",
  },
  "RNCfiles.Age": {
    headerName: "RNCfiles.Age",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Voter's age",
  },
  Sex: {
    headerName: "Sex",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Voter's sex (M/F)",
  },
  "VBM.AppType": {
    headerName: "VBM.AppType",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Optional Mail-in application type (e.g. Annual)",
  },
  County: {
    headerName: "County",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Optional numeric PA county code (e.g., 46 for Montgomery, 15 for Chester)",
  },
  Prev_Name: {
    headerName: "Prev_Name",
    requirementLevel: "reason-specific",
    requiredForReasons: ["name-change"],
    type: "string",
    isNullable: true,
    description: "Voter's previous registered name",
  },
  Prev_Address: {
    headerName: "Prev_Address",
    requirementLevel: "reason-specific",
    requiredForReasons: ["address-change", "new-movers"],
    type: "string",
    isNullable: true,
    description: "Voter's previous registered street address",
  },
  Prev_City: {
    headerName: "Prev_City",
    requirementLevel: "reason-specific",
    requiredForReasons: ["address-change", "new-movers"],
    type: "string",
    isNullable: true,
    description: "Voter's previous registered city",
  },
  Prev_State: {
    headerName: "Prev_State",
    requirementLevel: "reason-specific",
    requiredForReasons: ["address-change", "new-movers"],
    type: "string",
    isNullable: true,
    description: "Voter's previous registered state (e.g., PA or out-of-state code)",
  },
  Prev_Zip: {
    headerName: "Prev_Zip",
    requirementLevel: "reason-specific",
    requiredForReasons: ["address-change", "new-movers"],
    type: "string",
    isNullable: true,
    description: "Voter's previous registered ZIP code",
  },
  Prev_County: {
    headerName: "Prev_County",
    requirementLevel: "optional",
    type: "string",
    isNullable: true,
    description: "Voter's previous registered county",
  },
};

/**
 * Returns the exact column headers required for a specific application reason.
 */
export function getRequiredHeadersForReason(reason: string): string[] {
  return Object.values(DYNAMIC_CSV_SCHEMA)
    .filter((field) => {
      if (field.requirementLevel === "universal") return true;
      if (field.requirementLevel === "reason-specific" && field.requiredForReasons) {
        return field.requiredForReasons.includes(reason);
      }
      return false;
    })
    .map((field) => field.headerName);
}

/**
 * Generates sample data row values for CSV templates.
 */
export function getSampleDataForHeader(headerName: string, reason: string): string {
  switch (headerName) {
    case "First_Name":
      return "John";
    case "Middle_Name":
      return "Robert";
    case "Last_Name":
      return "Doe";
    case "Suffix":
      return "JR";
    case "Date_Of_Birth":
      return "11/04/1984";
    case "House__":
      return "123";
    case "StreetNameComplete":
      return "Main St";
    case "Apt__":
      return "";
    case "City":
      return "Norristown";
    case "State":
      return "PA";
    case "Zip_Code":
      return "19401";
    case "MAddress_Line_1":
      return "";
    case "MAddress_Line_2":
      return "";
    case "MCity":
      return "";
    case "MState":
      return "";
    case "MZip_Code":
      return "";
    case "Ward":
      return "1";
    case "RNCfiles.PrimaryPhone":
      return "555-0199";
    case "Voter_Status":
      return "Active";
    case "Precinct":
      return "810";
    case "RNCfiles.OfficialParty":
      return reason === "party-change" ? "REP" : "REP";
    case "RNCfiles.Age":
      return "41";
    case "Sex":
      return "M";
    case "VBM.AppType":
      return "Annual";
    case "County":
      return "46";
    case "Prev_Name":
      return "John R Smith";
    case "Prev_Address":
      return "456 Maple Ave";
    case "Prev_City":
      return "West Chester";
    case "Prev_State":
      return "PA";
    case "Prev_Zip":
      return "19380";
    case "Prev_County":
      return "Chester";
    default:
      return "";
  }
}

/**
 * Creates dynamic in-memory CSV template bytes/content based on application reason.
 * Includes universal fields + reason-specific fields + common optional fields.
 */
export function generateCsvTemplateContent(reason: string): string {
  const required = getRequiredHeadersForReason(reason);

  // Choose nice-to-have headers for each template to keep things highly user-friendly and feature-rich
  let optional: string[] = ["Precinct", "Ward", "RNCfiles.PrimaryPhone", "Sex", "RNCfiles.Age"];

  if (reason === "mail-in-voting") {
    optional = [...optional, "MAddress_Line_1", "MAddress_Line_2", "MCity", "MState", "MZip_Code", "VBM.AppType", "County"];
  } else if (reason === "new-movers" || reason === "address-change") {
    optional = [...optional, "Prev_County", "County"];
  } else {
    optional = [...optional, "County"];
  }

  const allHeaders = [...new Set([...required, ...optional])];
  const headerRow = allHeaders.join(",");
  const sampleRow = allHeaders.map((h) => getSampleDataForHeader(h, reason)).join(",");

  return `${headerRow}\n${sampleRow}`;
}
