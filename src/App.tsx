import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import CsvBatchPrinter from "./components/CsvBatchPrinter";
import AddressPrinter from "./components/AddressPrinter";
import HelpGuide from "./components/HelpGuide";

interface FieldCoord {
  name: string;
  label: string;
  x: number;
  y: number;
  type: "text" | "checkbox";
  pageIndex?: number;
}

const DEFAULT_COORDS_MAILIN: Record<string, FieldCoord> = {
  last_name: {
    name: "last_name",
    label: "Last Name",
    x: 242,
    y: 702,
    type: "text",
  },
  suffix_jr: {
    name: "suffix_jr",
    label: "Suffix Jr Box",
    x: 414,
    y: 706,
    type: "checkbox",
  },
  suffix_sr: {
    name: "suffix_sr",
    label: "Suffix Sr Box",
    x: 432,
    y: 706,
    type: "checkbox",
  },
  suffix_ii: {
    name: "suffix_ii",
    label: "Suffix II Box",
    x: 448,
    y: 706,
    type: "checkbox",
  },
  suffix_iii: {
    name: "suffix_iii",
    label: "Suffix III Box",
    x: 462,
    y: 706,
    type: "checkbox",
  },
  suffix_iv: {
    name: "suffix_iv",
    label: "Suffix IV Box",
    x: 480,
    y: 706,
    type: "checkbox",
  },
  first_name: {
    name: "first_name",
    label: "First Name",
    x: 242,
    y: 680,
    type: "text",
  },
  middle_name: {
    name: "middle_name",
    label: "Middle Name / Initial",
    x: 502,
    y: 680,
    type: "text",
  },
  birthdate: {
    name: "birthdate",
    label: "Birthdate (MM/DD/YYYY)",
    x: 272,
    y: 646,
    type: "text",
  },
  phone: {
    name: "phone",
    label: "Phone (Optional)",
    x: 398,
    y: 646,
    type: "text",
  },
  email: {
    name: "email",
    label: "Email (Optional)",
    x: 245,
    y: 624,
    type: "text",
  },
  address: {
    name: "address",
    label: "Address (not P.O. Box)",
    x: 272,
    y: 592,
    type: "text",
  },
  suite_number: {
    name: "suite_number",
    label: "Apt/Suite Number",
    x: 540,
    y: 592,
    type: "text",
  },
  city: { name: "city", label: "City/Town", x: 242, y: 568, type: "text" },
  state: { name: "state", label: "State", x: 390, y: 568, type: "text" },
  zip_code: {
    name: "zip_code",
    label: "ZIP Code",
    x: 458,
    y: 568,
    type: "text",
  },
  municipality: {
    name: "municipality",
    label: "Municipality",
    x: 254,
    y: 546,
    type: "text",
  },
  county: { name: "county", label: "County", x: 454, y: 546, type: "text" },
  precinct: {
    name: "precinct",
    label: "Voting District / Precinct",
    x: 282,
    y: 518,
    type: "text",
  },
  ward: { name: "ward", label: "Ward", x: 480, y: 522, type: "text" },
  mailing_address: {
    name: "mailing_address",
    label: "Mailing Address",
    x: 360,
    y: 468,
    type: "text",
  },
  mailing_city: {
    name: "mailing_city",
    label: "Mailing City",
    x: 254,
    y: 444,
    type: "text",
  },
  mailing_state: {
    name: "mailing_state",
    label: "Mailing State",
    x: 478,
    y: 444,
    type: "text",
  },
  mailing_zip: {
    name: "mailing_zip",
    label: "Mailing ZIP",
    x: 530,
    y: 444,
    type: "text",
  },
  annual_request: {
    name: "annual_request",
    label: "Annual Request Checkbox",
    x: 190,
    y: 208,
    type: "checkbox",
  },
};

const DEFAULT_COORDS_REGISTER: Record<string, FieldCoord> = {
  last_name: {
    name: "last_name",
    label: "Last Name",
    x: 248,
    y: 698,
    type: "text",
    pageIndex: 0,
  },
  suffix_jr: {
    name: "suffix_jr",
    label: "Suffix Jr Box",
    x: 414,
    y: 702,
    type: "checkbox",
    pageIndex: 0,
  },
  suffix_sr: {
    name: "suffix_sr",
    label: "Suffix Sr Box",
    x: 432,
    y: 702,
    type: "checkbox",
    pageIndex: 0,
  },
  suffix_ii: {
    name: "suffix_ii",
    label: "Suffix II Box",
    x: 448,
    y: 702,
    type: "checkbox",
    pageIndex: 0,
  },
  suffix_iii: {
    name: "suffix_iii",
    label: "Suffix III Box",
    x: 462,
    y: 702,
    type: "checkbox",
    pageIndex: 0,
  },
  suffix_iv: {
    name: "suffix_iv",
    label: "Suffix IV Box",
    x: 480,
    y: 702,
    type: "checkbox",
    pageIndex: 0,
  },
  first_name: {
    name: "first_name",
    label: "First Name",
    x: 248,
    y: 676,
    type: "text",
    pageIndex: 0,
  },
  middle_name: {
    name: "middle_name",
    label: "Middle Name / Initial",
    x: 504,
    y: 676,
    type: "text",
    pageIndex: 0,
  },
  birthdate: {
    name: "birthdate",
    label: "Birthdate (MM/DD/YYYY)",
    x: 272,
    y: 568,
    type: "text",
    pageIndex: 0,
  },
  phone: {
    name: "phone",
    label: "Phone (Optional)",
    x: 230,
    y: 550,
    type: "text",
    pageIndex: 0,
  },
  email: {
    name: "email",
    label: "Email (Optional)",
    x: 400,
    y: 550,
    type: "text",
    pageIndex: 0,
  },
  address: {
    name: "address",
    label: "Address (not P.O. Box)",
    x: 280,
    y: 504,
    type: "text",
    pageIndex: 0,
  },
  suite_number: {
    name: "suite_number",
    label: "Apt/Suite Number",
    x: 544,
    y: 504,
    type: "text",
    pageIndex: 0,
  },
  city: {
    name: "city",
    label: "City/Town",
    x: 242,
    y: 486,
    type: "text",
    pageIndex: 0,
  },
  state: {
    name: "state",
    label: "State",
    x: 390,
    y: 486,
    type: "text",
    pageIndex: 0,
  },
  zip_code: {
    name: "zip_code",
    label: "ZIP Code",
    x: 432,
    y: 486,
    type: "text",
    pageIndex: 0,
  },
  county: {
    name: "county",
    label: "County",
    x: 524,
    y: 486,
    type: "text",
    pageIndex: 0,
  },
  municipality: {
    name: "municipality",
    label: "Municipality",
    x: 244,
    y: 466,
    type: "text",
    pageIndex: 0,
  },
  precinct: {
    name: "precinct",
    label: "Voting District / Precinct",
    x: 310,
    y: 446,
    type: "text",
    pageIndex: 0,
  },
  ward: {
    name: "ward",
    label: "Ward",
    x: 390,
    y: 446,
    type: "text",
    pageIndex: 0,
  },
  mailing_address: {
    name: "mailing_address",
    label: "Mailing Address",
    x: 356,
    y: 422,
    type: "text",
    pageIndex: 0,
  },
  mailing_city: {
    name: "mailing_city",
    label: "Mailing City",
    x: 234,
    y: 402,
    type: "text",
    pageIndex: 0,
  },
  mailing_state: {
    name: "mailing_state",
    label: "Mailing State",
    x: 480,
    y: 402,
    type: "text",
    pageIndex: 0,
  },
  mailing_zip: {
    name: "mailing_zip",
    label: "Mailing ZIP",
    x: 528,
    y: 402,
    type: "text",
    pageIndex: 0,
  },
  annual_request: {
    name: "annual_request",
    label: "Annual Request Checkbox",
    x: 189,
    y: 206,
    type: "checkbox",
    pageIndex: 0,
  },

  // Page 1 Section 9 coordinates (Previous registration details)
  prev_name: {
    name: "prev_name",
    label: "Sec 9: Previous Name",
    x: 248,
    y: 312,
    type: "text",
    pageIndex: 0,
  },
  prev_address: {
    name: "prev_address",
    label: "Sec 9: Previous Address",
    x: 248,
    y: 268,
    type: "text",
    pageIndex: 0,
  },
  prev_city: {
    name: "prev_city",
    label: "Sec 9: Previous City",
    x: 242,
    y: 224,
    type: "text",
    pageIndex: 0,
  },
  prev_state: {
    name: "prev_state",
    label: "Sec 9: Previous State",
    x: 390,
    y: 224,
    type: "text",
    pageIndex: 0,
  },
  prev_zip: {
    name: "prev_zip",
    label: "Sec 9: Previous ZIP",
    x: 432,
    y: 224,
    type: "text",
    pageIndex: 0,
  },
  prev_county: {
    name: "prev_county",
    label: "Sec 9: Previous County",
    x: 524,
    y: 224,
    type: "text",
    pageIndex: 0,
  },
  prev_voter_no: {
    name: "prev_voter_no",
    label: "Sec 9: Previous Voter No",
    x: 248,
    y: 225,
    type: "text",
    pageIndex: 0,
  },
  prev_year: {
    name: "prev_year",
    label: "Sec 9: Previous Year",
    x: 524,
    y: 225,
    type: "text",
    pageIndex: 0,
  },

  // Newly Researched State Portal Fields
  is_citizen_yes: {
    name: "is_citizen_yes",
    label: "Sec 2: US Citizen Yes Box",
    x: 306,
    y: 652,
    type: "checkbox",
    pageIndex: 0,
  },
  is_citizen_no: {
    name: "is_citizen_no",
    label: "Sec 2: US Citizen No Box",
    x: 340,
    y: 652,
    type: "checkbox",
    pageIndex: 0,
  },
  is_at_least_18_yes: {
    name: "is_at_least_18_yes",
    label: "Sec 2: Age 18+ Yes Box",
    x: 306,
    y: 632,
    type: "checkbox",
    pageIndex: 0,
  },
  is_at_least_18_no: {
    name: "is_at_least_18_no",
    label: "Sec 2: Age 18+ No Box",
    x: 340,
    y: 632,
    type: "checkbox",
    pageIndex: 0,
  },
  is_citizen: {
    name: "is_citizen",
    label: "Sec 2: US Citizen (Yes/No)",
    x: 100,
    y: 720,
    type: "text",
    pageIndex: 0,
  },
  is_at_least_18: {
    name: "is_at_least_18",
    label: "Sec 2: Age 18+ (Yes/No)",
    x: 200,
    y: 720,
    type: "text",
    pageIndex: 0,
  },
  gender: {
    name: "gender",
    label: "Sec 4: Gender",
    x: 248,
    y: 550,
    type: "text",
    pageIndex: 0,
  },
  race: {
    name: "race",
    label: "Sec 4: Race / Ethnic Group",
    x: 410,
    y: 568,
    type: "text",
    pageIndex: 0,
  },
  id_dl_number: {
    name: "id_dl_number",
    label: "Sec 5: PA DL / PennDOT ID",
    x: 380,
    y: 377,
    type: "text",
    pageIndex: 0,
  },
  id_ssn_last4: {
    name: "id_ssn_last4",
    label: "Sec 5: SSN Last 4 Digits",
    x: 438,
    y: 356,
    type: "text",
    pageIndex: 0,
  },
  party_choice: {
    name: "party_choice",
    label: "Sec 8: Party Choice",
    x: 250,
    y: 180,
    type: "text",
    pageIndex: 0,
  },
  party_choice_other: {
    name: "party_choice_other",
    label: "Sec 8: Other Party Text",
    x: 382,
    y: 180,
    type: "text",
    pageIndex: 0,
  },
  requires_assistance: {
    name: "requires_assistance",
    label: "Sec 10: Voting Assistance (Yes/No)",
    x: 192,
    y: 159,
    type: "text",
    pageIndex: 0,
  },
  assistance_reason: {
    name: "assistance_reason",
    label: "Sec 10: Assistance Details",
    x: 420,
    y: 159,
    type: "text",
    pageIndex: 0,
  },
};

export interface CsvFieldSchema {
  headerName: string;
  isRequired: boolean;
  type: "string" | "string[]";
  isNullable: boolean;
  description: string;
}

export const CSV_SCHEMA: Record<string, CsvFieldSchema> = {
  First_Name: {
    headerName: "First_Name",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "First name of the voter",
  },
  Middle_Name: {
    headerName: "Middle_Name",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Middle name or initial of the voter",
  },
  Last_Name: {
    headerName: "Last_Name",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Last name of the voter",
  },
  Suffix: {
    headerName: "Suffix",
    isRequired: true,
    type: "string[]",
    isNullable: true,
    description: "Suffix of the voter (e.g. JR, SR, III, IV)",
  },
  Date_Of_Birth: {
    headerName: "Date_Of_Birth",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Birthdate of the voter (MM/DD/YYYY)",
  },
  House__: {
    headerName: "House__",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "House number of the voter",
  },
  StreetNameComplete: {
    headerName: "StreetNameComplete",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Street name of the voter",
  },
  Apt__: {
    headerName: "Apt__",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Apartment or suite number of the voter",
  },
  City: {
    headerName: "City",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "City or town",
  },
  State: {
    headerName: "State",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "State code (e.g. PA)",
  },
  Zip_Code: {
    headerName: "Zip_Code",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "ZIP code",
  },
  MAddress_Line_1: {
    headerName: "MAddress_Line_1",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Mailing address line 1",
  },
  MAddress_Line_2: {
    headerName: "MAddress_Line_2",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Mailing address line 2",
  },
  MCity: {
    headerName: "MCity",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Mailing city",
  },
  MState: {
    headerName: "MState",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Mailing state",
  },
  MZip_Code: {
    headerName: "MZip_Code",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Mailing ZIP code",
  },
  PollingPlaceDescript: {
    headerName: "PollingPlaceDescript",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Description of the polling place",
  },
  Ward: {
    headerName: "Ward",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Ward number",
  },
  "RNCfiles.PrimaryPhone": {
    headerName: "RNCfiles.PrimaryPhone",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Voter's primary phone number",
  },
  Voter_Status: {
    headerName: "Voter_Status",
    isRequired: true,
    type: "string",
    isNullable: true,
    description: "Status of the voter",
  },
  Precinct: {
    headerName: "Precinct",
    isRequired: false,
    type: "string",
    isNullable: true,
    description: "Precinct identifier",
  },
  "RNCfiles.OfficialParty": {
    headerName: "RNCfiles.OfficialParty",
    isRequired: false,
    type: "string",
    isNullable: true,
    description: "Official registered political party",
  },
  "RNCfiles.Age": {
    headerName: "RNCfiles.Age",
    isRequired: false,
    type: "string",
    isNullable: true,
    description: "Voter's age",
  },
  Sex: {
    headerName: "Sex",
    isRequired: false,
    type: "string",
    isNullable: true,
    description: "Voter's sex",
  },
  "VBM.AppType": {
    headerName: "VBM.AppType",
    isRequired: false,
    type: "string",
    isNullable: true,
    description: "Type of mail-in/absentee application",
  },
};

const REQUIRED_HEADERS = Object.values(CSV_SCHEMA)
  .filter((field) => field.isRequired)
  .map((field) => field.headerName);

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("mail-in-voting");
  const [coords, setCoords] = useState<Record<string, FieldCoord>>(() => {
    const saved = localStorage.getItem("mib-mailin-coords");
    return saved ? JSON.parse(saved) : DEFAULT_COORDS_MAILIN;
  });
  const [mediumFontBytes, setMediumFontBytes] = useState<ArrayBuffer | null>(
    null,
  );
  const [pdfTemplateLoaded, setPdfTemplateLoaded] = useState<boolean | null>(
    null,
  );

  // Dynamically load coordinates when activeTab changes
  useEffect(() => {
    const isMailIn = activeTab === "mail-in-voting";
    const storageKey = isMailIn
      ? "mib-mailin-coords"
      : "mib-registration-coords";
    const defaultCoords = isMailIn
      ? DEFAULT_COORDS_MAILIN
      : DEFAULT_COORDS_REGISTER;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCoords(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    setCoords(defaultCoords);
  }, [activeTab]);

  // Load Custom Medium Font
  useEffect(() => {
    fetch("/Inter-Medium.ttf")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load local font");
        return res.arrayBuffer();
      })
      .then((bytes) => {
        setMediumFontBytes(bytes);
        console.log("Local Medium font loaded successfully.");
      })
      .catch((err) => {
        console.error(
          "Error loading local Medium font, falling back to standard HelveticaBold:",
          err,
        );
      });
  }, []);

  // Load PDF Template to check readiness
  useEffect(() => {
    fetch("/PADOS_MailInApplication.pdf")
      .then((res) => {
        if (res.ok) {
          setPdfTemplateLoaded(true);
        } else {
          setPdfTemplateLoaded(false);
          console.error("PDF Template was not found in the public folder.");
        }
      })
      .catch((err) => {
        setPdfTemplateLoaded(false);
        console.error("Error loading PDF template:", err);
      });
  }, []);

  const handleCoordinateChange = (
    fieldName: string,
    axis: "x" | "y",
    val: number,
  ) => {
    setCoords((prev) => {
      const updated = {
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          [axis]: Math.max(0, val),
        },
      };
      const isMailIn = activeTab === "mail-in-voting";
      const storageKey = isMailIn
        ? "mib-mailin-coords"
        : "mib-registration-coords";
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const resetCoordinates = () => {
    const isMailIn = activeTab === "mail-in-voting";
    const defaultCoords = isMailIn
      ? DEFAULT_COORDS_MAILIN
      : DEFAULT_COORDS_REGISTER;
    setCoords(defaultCoords);
    const storageKey = isMailIn
      ? "mib-mailin-coords"
      : "mib-registration-coords";
    localStorage.removeItem(storageKey);
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      pdfTemplateLoaded={pdfTemplateLoaded}
    >
      {[
        "mail-in-voting",
        "new-registration",
        "address-change",
        "name-change",
        "party-change",
        "federal-military",
      ].includes(activeTab) && (
        <CsvBatchPrinter
          coords={coords}
          resetCoordinates={resetCoordinates}
          handleCoordinateChange={handleCoordinateChange}
          mediumFontBytes={mediumFontBytes}
          pdfTemplateLoaded={pdfTemplateLoaded}
          requiredHeaders={REQUIRED_HEADERS}
          applicationReason={activeTab}
        />
      )}

      {activeTab === "county-address" && (
        <AddressPrinter mediumFontBytes={mediumFontBytes} />
      )}

      {activeTab === "help-guide" && <HelpGuide />}
    </Layout>
  );
}
