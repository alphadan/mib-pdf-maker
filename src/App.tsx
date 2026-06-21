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

const DEFAULT_COORDS: Record<string, FieldCoord> = {
  last_name: {
    name: "last_name",
    label: "Last Name",
    x: 255,
    y: 698,
    type: "text",
  },
  suffix: {
    name: "suffix",
    label: "Suffix (Jr, Sr, etc.)",
    x: 425,
    y: 698,
    type: "text",
  },
  first_name: {
    name: "first_name",
    label: "First Name",
    x: 255,
    y: 681,
    type: "text",
  },
  middle_name: {
    name: "middle_name",
    label: "Middle Name / Initial",
    x: 425,
    y: 681,
    type: "text",
  },
  birthdate: {
    name: "birthdate",
    label: "Birthdate (MM/DD/YYYY)",
    x: 255,
    y: 648,
    type: "text",
  },
  phone: {
    name: "phone",
    label: "Phone (Optional)",
    x: 370,
    y: 648,
    type: "text",
  },
  email: {
    name: "email",
    label: "Email (Optional)",
    x: 255,
    y: 631,
    type: "text",
  },
  address: {
    name: "address",
    label: "Address (not P.O. Box)",
    x: 255,
    y: 596,
    type: "text",
  },
  suite_number: {
    name: "suite_number",
    label: "Apt/Suite Number",
    x: 430,
    y: 596,
    type: "text",
  },
  city: { name: "city", label: "City/Town", x: 255, y: 579, type: "text" },
  state: { name: "state", label: "State", x: 355, y: 579, type: "text" },
  zip_code: {
    name: "zip_code",
    label: "ZIP Code",
    x: 390,
    y: 579,
    type: "text",
  },
  municipality: {
    name: "municipality",
    label: "Municipality",
    x: 255,
    y: 558,
    type: "text",
  },
  county: { name: "county", label: "County", x: 370, y: 558, type: "text" },
  precinct: {
    name: "precinct",
    label: "Voting District / Precinct",
    x: 255,
    y: 534,
    type: "text",
  },
  ward: { name: "ward", label: "Ward", x: 370, y: 534, type: "text" },
  mailing_address: {
    name: "mailing_address",
    label: "Mailing Address",
    x: 320,
    y: 468,
    type: "text",
  },
  mailing_city: {
    name: "mailing_city",
    label: "Mailing City",
    x: 255,
    y: 451,
    type: "text",
  },
  mailing_state: {
    name: "mailing_state",
    label: "Mailing State",
    x: 370,
    y: 451,
    type: "text",
  },
  mailing_zip: {
    name: "mailing_zip",
    label: "Mailing ZIP",
    x: 405,
    y: 451,
    type: "text",
  },
  annual_request: {
    name: "annual_request",
    label: "Annual Request Checkbox",
    x: 262,
    y: 273,
    type: "checkbox",
  },
};

const REQUIRED_HEADERS = Object.keys(DEFAULT_COORDS);

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("csv-batch");
  const [coords, setCoords] =
    useState<Record<string, FieldCoord>>(DEFAULT_COORDS);
  const [mediumFontBytes, setMediumFontBytes] = useState<ArrayBuffer | null>(
    null,
  );
  const [pdfTemplateLoaded, setPdfTemplateLoaded] = useState<boolean | null>(
    null,
  );

  // Load Custom Inter Medium Font
  useEffect(() => {
    fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-500-normal.ttf",
    )
      .then((res) => {
        if (!res.ok) throw new Error("Could not load font");
        return res.arrayBuffer();
      })
      .then((bytes) => {
        setMediumFontBytes(bytes);
        console.log("Inter Medium font loaded successfully.");
      })
      .catch((err) => {
        console.error(
          "Error loading custom Inter font, falling back to standard HelveticaBold:",
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
    setCoords(DEFAULT_COORDS);
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
        <NewResidentsForm coords={coords} mediumFontBytes={mediumFontBytes} />
      )}

      {activeTab === "help-guide" && <HelpGuide />}
    </Layout>
  );
}
