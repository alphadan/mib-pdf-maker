export interface FormUseConfig {
  formType: string;
  tabId: string;
  pdfTemplate: string;
  universalFields: string[];
  optionalFields: string[];
  requiredReasonSpecific: string[];
  optionalReasonSpecific: string[];
}

/**
 * 📊 Official Form Use Configurations
 * Groups spreadsheet columns into Green (Universal), Blue (Optional), and Yellow (Reason-Specific)
 * to align perfectly with your spreadsheet model.
 */
export const FORM_USES: FormUseConfig[] = [
  {
    formType: "Mail-In",
    tabId: "mail-in-voting",
    pdfTemplate: "/PADOS_MailInApplication.pdf",
    universalFields: ["First_Name", "Middle_Name", "Last_Name", "Suffix", "House__", "StreetNameComplete", "Apt__", "City", "Zip_Code", "RNCfiles.HouseholdParty", "Precinct", "RNCfiles.Age", "Sex", "Date_Of_Birth", "County"],
    optionalFields: ["RNCfiles.PrimaryPhone", "Email", "Municipality", "Ward", "Lived_Since", "MAddress_Line_1", "MAddress_Line_2", "MCity", "MState", "MZip_Code"],
    requiredReasonSpecific: [],
    optionalReasonSpecific: ["Reason", "Citizen", "RNCfiles.OfficialParty", "Prev_Name", "Prev_Address", "Mib_Address", "Mib_City", "Mib_State", "Mib_Zip"]
  },
  {
    formType: "New Registration",
    tabId: "new-registration",
    pdfTemplate: "/PADOS_Registration_Application.pdf",
    universalFields: ["First_Name", "Middle_Name", "Last_Name", "Suffix", "House__", "StreetNameComplete", "Apt__", "City", "Zip_Code", "RNCfiles.HouseholdParty", "Precinct", "RNCfiles.Age", "Sex", "Date_Of_Birth", "County"],
    optionalFields: ["RNCfiles.PrimaryPhone", "Email", "Municipality", "Ward", "Lived_Since", "MAddress_Line_1", "MAddress_Line_2", "MCity", "MState", "MZip_Code"],
    requiredReasonSpecific: ["Citizen", "RNCfiles.OfficialParty"],
    optionalReasonSpecific: ["Reason", "Prev_Name", "Prev_Address", "Mib_Address", "Mib_City", "Mib_State", "Mib_Zip"]
  },
  {
    formType: "Change Name",
    tabId: "name-change",
    pdfTemplate: "/PADOS_Registration_Application.pdf",
    universalFields: ["First_Name", "Middle_Name", "Last_Name", "Suffix", "House__", "StreetNameComplete", "Apt__", "City", "Zip_Code", "RNCfiles.HouseholdParty", "Precinct", "RNCfiles.Age", "Sex", "Date_Of_Birth", "County"],
    optionalFields: ["RNCfiles.PrimaryPhone", "Email", "Municipality", "Ward", "Lived_Since", "MAddress_Line_1", "MAddress_Line_2", "MCity", "MState", "MZip_Code"],
    requiredReasonSpecific: ["Citizen", "RNCfiles.OfficialParty", "Prev_Name"],
    optionalReasonSpecific: ["Reason", "Prev_Address", "Mib_Address", "Mib_City", "Mib_State", "Mib_Zip"]
  },
  {
    formType: "Change Address",
    tabId: "address-change",
    pdfTemplate: "/PADOS_Registration_Application.pdf",
    universalFields: ["First_Name", "Middle_Name", "Last_Name", "Suffix", "House__", "StreetNameComplete", "Apt__", "City", "Zip_Code", "RNCfiles.HouseholdParty", "Precinct", "RNCfiles.Age", "Sex", "Date_Of_Birth", "County"],
    optionalFields: ["RNCfiles.PrimaryPhone", "Email", "Municipality", "Ward", "Lived_Since", "MAddress_Line_1", "MAddress_Line_2", "MCity", "MState", "MZip_Code"],
    requiredReasonSpecific: ["Citizen", "RNCfiles.OfficialParty", "Prev_Address"],
    optionalReasonSpecific: ["Reason", "Prev_Name", "Mib_Address", "Mib_City", "Mib_State", "Mib_Zip"]
  },
  {
    formType: "Change Party",
    tabId: "party-change",
    pdfTemplate: "/PADOS_Registration_Application.pdf",
    universalFields: ["First_Name", "Middle_Name", "Last_Name", "Suffix", "House__", "StreetNameComplete", "Apt__", "City", "Zip_Code", "RNCfiles.HouseholdParty", "Precinct", "RNCfiles.Age", "Sex", "Date_Of_Birth", "County"],
    optionalFields: ["RNCfiles.PrimaryPhone", "Email", "Municipality", "Ward", "Lived_Since", "MAddress_Line_1", "MAddress_Line_2", "MCity", "MState", "MZip_Code"],
    requiredReasonSpecific: ["Citizen", "RNCfiles.OfficialParty"],
    optionalReasonSpecific: ["Reason", "Prev_Name", "Prev_Address", "Mib_Address", "Mib_City", "Mib_State", "Mib_Zip"]
  },
  {
    formType: "Federal Residence",
    tabId: "federal-military",
    pdfTemplate: "/PADOS_Registration_Application.pdf",
    universalFields: ["First_Name", "Middle_Name", "Last_Name", "Suffix", "House__", "StreetNameComplete", "Apt__", "City", "Zip_Code", "RNCfiles.HouseholdParty", "Precinct", "RNCfiles.Age", "Sex", "Date_Of_Birth", "County"],
    optionalFields: ["RNCfiles.PrimaryPhone", "Email", "Municipality", "Ward", "Lived_Since", "MAddress_Line_1", "MAddress_Line_2", "MCity", "MState", "MZip_Code"],
    requiredReasonSpecific: ["Citizen", "RNCfiles.OfficialParty"],
    optionalReasonSpecific: ["Reason", "Prev_Name", "Prev_Address", "Mib_Address", "Mib_City", "Mib_State", "Mib_Zip"]
  },
  {
    formType: "New Movers",
    tabId: "new-movers",
    pdfTemplate: "/PADOS_Registration_Application.pdf",
    universalFields: ["First_Name", "Middle_Name", "Last_Name", "Suffix", "House__", "StreetNameComplete", "Apt__", "City", "Zip_Code", "RNCfiles.HouseholdParty", "Precinct", "RNCfiles.Age", "Sex", "Date_Of_Birth", "County"],
    optionalFields: ["RNCfiles.PrimaryPhone", "Email", "Municipality", "Ward", "Lived_Since", "MAddress_Line_1", "MAddress_Line_2", "MCity", "MState", "MZip_Code"],
    requiredReasonSpecific: ["Citizen", "RNCfiles.OfficialParty", "Prev_Address"],
    optionalReasonSpecific: ["Reason", "Prev_Name", "Mib_Address", "Mib_City", "Mib_State", "Mib_Zip"]
  }
];

/**
 * 📋 Master Column Layout Order matching your third party source exactly,
 * with any yellow/reason-specific fields cleanly appended at the end.
 */
export const SPREADSHEET_COLUMNS_ORDER = [
  "Precinct",
  "First_Name",
  "Middle_Name",
  "Last_Name",
  "Suffix",
  "House__",
  "StreetNameComplete",
  "Apt__",
  "City",
  "Zip_Code",
  "County",
  "Date_Of_Birth",
  "RNCfiles.Age",
  "Sex",
  "RNCfiles.HouseholdParty",
  "RNCfiles.PrimaryPhone",
  "Email",
  "Municipality",
  "Ward",
  "Lived_Since",
  "MAddress_Line_1",
  "MAddress_Line_2",
  "MCity",
  "MState",
  "MZip_Code",
  "Reason",
  "Citizen",
  "RNCfiles.OfficialParty",
  "Prev_Name",
  "Prev_Address",
  "Mib_Address",
  "Mib_City",
  "Mib_State",
  "Mib_Zip"
];

/**
 * Returns the exact column headers required for a specific application reason.
 * Combines Universal (Green) fields with Required Reason-Specific (Yellow) fields.
 */
export function getRequiredHeadersForReason(reason: string): string[] {
  const config = FORM_USES.find((f) => f.tabId === reason);
  if (!config) return [];
  return [...config.universalFields, ...config.requiredReasonSpecific];
}

/**
 * Filters the master ordered spreadsheet columns to retrieve all columns relevant to a specific tab,
 * maintaining the exact left-to-right third party column layout order.
 */
export function getColumnsForReason(reason: string): string[] {
  const config = FORM_USES.find((f) => f.tabId === reason);
  if (!config) return SPREADSHEET_COLUMNS_ORDER;

  const relevantFields = new Set([
    ...config.universalFields,
    ...config.optionalFields,
    ...config.requiredReasonSpecific,
    ...config.optionalReasonSpecific
  ]);

  // Maintain precise third party column order
  return SPREADSHEET_COLUMNS_ORDER.filter((col) => relevantFields.has(col));
}

/**
 * Generates mock sample data row values for CSV templates.
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
    case "House__":
      return "123";
    case "StreetNameComplete":
      return "Main St";
    case "Apt__":
      return ""; // Default value is empty/Null, but the required column header is present!
    case "City":
      return "Atglen";
    case "Zip_Code":
      return "19310";
    case "County":
      return "15"; // Chester County code
    case "Date_Of_Birth":
      return "11/04/1984";
    case "Precinct":
      return "5";
    case "RNCfiles.PrimaryPhone":
      return "555-0199";
    case "Email":
      return "john.doe@example.com";
    case "Municipality":
      return "Atglen Borough";
    case "Ward":
      return "";
    case "Lived_Since":
      return "2015";
    case "MAddress_Line_1":
      return reason === "mail-in-voting" ? "" : "P.O. Box 789";
    case "MAddress_Line_2":
      return "";
    case "MCity":
      return reason === "mail-in-voting" ? "" : "Harrisburg";
    case "MState":
      return reason === "mail-in-voting" ? "" : "PA";
    case "MZip_Code":
      return reason === "mail-in-voting" ? "" : "17101";
    case "Reason":
      return reason === "new-registration"
        ? "New Registration"
        : reason === "name-change"
          ? "Name Change"
          : reason === "address-change"
            ? "Address Change"
            : reason === "party-change"
              ? "Party Change"
              : reason === "new-movers"
                ? "New Movers"
                : "";
    case "Citizen":
      return "yes";
    case "RNCfiles.Age":
      return "42";
    case "Sex":
      return "Male";
    case "RNCfiles.OfficialParty":
      return "Republican";
    case "Prev_Name":
      return reason === "name-change" ? "John R Smith" : "";
    case "Prev_Address":
      return reason === "address-change" || reason === "new-movers" ? "123 S Main St West Chester PA 19382" : "";
    case "Mib_Address":
      return reason === "mail-in-voting" ? "789 Pine Rd" : "";
    case "Mib_City":
      return reason === "mail-in-voting" ? "Norristown" : "";
    case "Mib_State":
      return reason === "mail-in-voting" ? "PA" : "";
    case "Mib_Zip":
      return reason === "mail-in-voting" ? "19401" : "";
    case "RNCfiles.HouseholdParty":
    case "household_party":
    case "householdParty":
    case "HHParty":
      return "Republican";
    default:
      return "";
  }
}

/**
 * Creates dynamic in-memory CSV template content based on application reason.
 * Includes universal fields + optional fields + reason-specific fields in correct column order.
 */
export function generateCsvTemplateContent(reason: string): string {
  const columns = getColumnsForReason(reason);
  const headerRow = columns.join(",");
  const sampleRow = columns.map((h) => getSampleDataForHeader(h, reason)).join(",");
  return `${headerRow}\n${sampleRow}`;
}
