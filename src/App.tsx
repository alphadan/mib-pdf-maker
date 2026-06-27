import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import CsvBatchPrinter from "./components/CsvBatchPrinter";
import AddressPrinter from "./components/AddressPrinter";
import NewResidentsForm from "./components/NewResidentsForm";
import HelpGuide from "./components/HelpGuide";

interface FieldCoord {
  name: string;
  label: string;
  x: number;
  y: number;
  type: "text" | "checkbox";
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
    x: 262,
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
  const [activeTab, setActiveTab] = useState<string>("csv-batch");
  const [coords, setCoords] = useState<Record<string, FieldCoord>>(
    DEFAULT_COORDS_MAILIN,
  );
  const [mediumFontBytes, setMediumFontBytes] = useState<ArrayBuffer | null>(
    null,
  );
  const [pdfTemplateLoaded, setPdfTemplateLoaded] = useState<boolean | null>(
    null,
  );

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
    setCoords((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        [axis]: Math.max(0, val),
      },
    }));
  };

  const resetCoordinates = () => {
    setCoords(DEFAULT_COORDS_MAILIN);
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      pdfTemplateLoaded={pdfTemplateLoaded}
    >
      {activeTab === "csv-batch" && (
        <CsvBatchPrinter
          coords={coords}
          resetCoordinates={resetCoordinates}
          handleCoordinateChange={handleCoordinateChange}
          mediumFontBytes={mediumFontBytes}
          pdfTemplateLoaded={pdfTemplateLoaded}
          requiredHeaders={REQUIRED_HEADERS}
        />
      )}

      {activeTab === "county-address" && (
        <AddressPrinter mediumFontBytes={mediumFontBytes} />
      )}

      {activeTab === "new-resident" && (
        <NewResidentsForm mediumFontBytes={mediumFontBytes} />
      )}

      {activeTab === "help-guide" && <HelpGuide />}
    </Layout>
  );
}
