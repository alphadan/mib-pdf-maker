import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  FileSpreadsheet,
  CheckCircle2,
  Download,
  RefreshCw,
  Printer,
  Settings,
  FileText,
  AlertTriangle,
} from "lucide-react";

import NewResidentsForm from "./NewResidentsForm";
import CsvUploadCenter from "./CsvUploadCenter";
import VoterApplicationsList from "./VoterApplicationsList";
import WalkingChecklist from "./WalkingChecklist";
import { resolveCounty } from "../utils/paVoterLookups";
import precincts from "../utils/precincts.json";

interface FieldCoord {
  name: string;
  label: string;
  x: number;
  y: number;
  type: "text" | "checkbox";
  pageIndex?: number;
}

interface CsvBatchPrinterProps {
  coords: Record<string, FieldCoord>;
  resetCoordinates: () => void;
  handleCoordinateChange: (
    fieldName: string,
    axis: "x" | "y",
    val: number,
  ) => void;
  mediumFontBytes: ArrayBuffer | null;
  pdfTemplateLoaded: boolean | null;
  requiredHeaders: string[];
  applicationReason: string;
}

const getPartyInitial = (partyVal: any): string => {
  if (partyVal === null || partyVal === undefined) return "NF";
  const cleanParty = String(partyVal).trim().toLowerCase();
  if (
    cleanParty === "" ||
    cleanParty === "null" ||
    cleanParty === "none" ||
    cleanParty === "n/a" ||
    cleanParty === "not found"
  ) {
    return "NF";
  }
  if (cleanParty.startsWith("dem") || cleanParty === "d") {
    return "D";
  }
  if (cleanParty.startsWith("rep") || cleanParty === "r") {
    return "R";
  }
  if (
    cleanParty.startsWith("ind") ||
    cleanParty === "i" ||
    cleanParty.startsWith("una")
  ) {
    return "I";
  }
  if (cleanParty.startsWith("g")) {
    return "G";
  }
  if (cleanParty.startsWith("l")) {
    return "L";
  }
  return "I"; // Default / Other
};

export default function CsvBatchPrinter({
  coords,
  resetCoordinates,
  handleCoordinateChange,
  mediumFontBytes,
  requiredHeaders,
  applicationReason,
}: CsvBatchPrinterProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [missingHeaders, setMissingHeaders] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showCoordsEditor, setShowCoordsEditor] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");
  const [generatedBlobUrl, setGeneratedBlobUrl] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "upload" | "manual" | "preview" | "walklist"
  >("upload");
  const [isGeneratingWalkList, setIsGeneratingWalkList] =
    useState<boolean>(false);
  const [printDobAndPhone, setPrintDobAndPhone] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset the file and records whenever the application reason changes
  useEffect(() => {
    setCsvFile(null);
    setRecords([]);
    setValidationError(null);
    setMissingHeaders([]);
    setActiveTab("upload");
    setCurrentPage(1);
  }, [applicationReason]);

  const processCSV = (file: File) => {
    setValidationError(null);
    setMissingHeaders([]);
    setRecords([]);

    if (!file.name.endsWith(".csv")) {
      setValidationError(
        "Invalid file format. Please upload a spreadsheet with a .csv extension.",
      );
      return;
    }

    // Security check: Limit file size to 5MB to prevent client-side Denial of Service (DoS)
    const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(
        `File size limit exceeded. To protect system performance, the maximum CSV size allowed is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
      );
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];

        // Find missing headers (case sensitive checklist)
        const missing = requiredHeaders.filter((h) => !headers.includes(h));

        if (missing.length > 0) {
          setMissingHeaders(missing);
          setValidationError(
            `The CSV is missing ${missing.length} required field columns.`,
          );
          return;
        }

        const rawData = results.data;

        if (rawData.length === 0) {
          setValidationError(
            "The CSV file does not contain any voter records.",
          );
          return;
        }

        if (rawData.length > 500) {
          setValidationError(
            `Batch limit exceeded. You uploaded ${rawData.length} records, but the suite is limited to a maximum of 500 records to protect memory and client performance.`,
          );
          return;
        }

        const mappedData = rawData.map((record: any) => {
          return {
            ...record,
            last_name: record.Last_Name || "",
            suffix: record.Suffix || "",
            first_name: record.First_Name || "",
            middle_name: record.Middle_Name || "",
            birthdate: record.Date_Of_Birth || "",
            phone: record["RNCfiles.PrimaryPhone"] || "",
            sex: record.Sex || "",
            suite_number: record.Apt__ || "",
            city: record.City || "",
            state: record.State || "",
            zip_code: record.Zip_Code || "",
            precinct: record.Precinct || "",
            ward: record.Ward || "",
            mailing_city: record.MCity || "",
            mailing_state: record.MState || "",
            mailing_zip: record.MZip_Code || "",
            county: resolveCounty(record.County),
            municipality: (() => {
              const precinctVal = String(record.Precinct || "").trim();
              if (!precinctVal) return "";
              const padded = precinctVal.padStart(3, "0");
              const found = precincts.find(
                (p: any) =>
                  String(p.number) === padded ||
                  String(p.number) === precinctVal,
              );
              return found ? found.municipality : "";
            })(),
            household_party: record.householdParty || "",

            // Construct virtual compound fields for overlaying
            address:
              `${record.House__ || ""} ${record.StreetNameComplete || ""}`.trim(),
            mailing_address:
              `${record.MAddress_Line_1 || ""} ${record.MAddress_Line_2 || ""}`.trim(),
            annual_request: String(record["VBM.AppType"] || "")
              .toLowerCase()
              .includes("annual")
              ? "yes"
              : "no",
          };
        });

        // Automatically sort records by Precinct -> Street Name -> House Number -> Apt Number
        const sortedData = [...mappedData].sort((a, b) => {
          const precinctA = String(a.Precinct || "")
            .trim()
            .toLowerCase();
          const precinctB = String(b.Precinct || "")
            .trim()
            .toLowerCase();
          if (precinctA !== precinctB)
            return precinctA.localeCompare(precinctB);

          const streetA = String(a.StreetNameComplete || "")
            .trim()
            .toLowerCase();
          const streetB = String(b.StreetNameComplete || "")
            .trim()
            .toLowerCase();
          if (streetA !== streetB) return streetA.localeCompare(streetB);

          const houseANum = parseInt(a.House__) || 0;
          const houseBNum = parseInt(b.House__) || 0;
          if (houseANum !== houseBNum) return houseANum - houseBNum;

          const aptA = String(a.Apt__ || "")
            .trim()
            .toLowerCase();
          const aptB = String(b.Apt__ || "")
            .trim()
            .toLowerCase();
          return aptA.localeCompare(aptB);
        });

        setCsvFile(file);
        setRecords(sortedData);
        setCurrentPage(1);
        setActiveTab("preview");
      },
      error: (err) => {
        setValidationError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const downloadSampleCSV = () => {
    const TEMPLATE_FILENAMES: Record<string, string> = {
      "mail-in-voting": "mail_in_ballot_template.csv",
      "new-registration": "new_voter_registration_template.csv",
      "address-change": "change_address_template.csv",
      "name-change": "change_name_template.csv",
      "party-change": "change_party_template.csv",
      "federal-military": "federal_move_template.csv",
    };

    // Dynamically resolve template URL based on application purpose
    const url =
      applicationReason === "new-movers"
        ? "/pa_new_movers.csv"
        : "/pa_voter_ballots_sample.csv";

    const targetName =
      TEMPLATE_FILENAMES[applicationReason] || "voter_database_template.csv";

    const link = document.createElement("a");
    link.href = url;
    // Set matching clean download filename
    link.setAttribute("download", targetName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processCSV(files[0]);
    }
  };

  const clearFile = () => {
    setCsvFile(null);
    setRecords([]);
    setValidationError(null);
    setMissingHeaders([]);
    setGeneratedBlobUrl(null);
    setIsSuccess(false);
    setActiveTab("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateWalkListPDF = async () => {
    if (records.length === 0) return;
    setIsGeneratingWalkList(true);

    try {
      const walkListPdf = await PDFDocument.create();
      walkListPdf.registerFontkit(fontkit);

      const fontMedium = mediumFontBytes
        ? await walkListPdf.embedFont(mediumFontBytes)
        : await walkListPdf.embedFont(StandardFonts.Helvetica);
      const fontBold = await walkListPdf.embedFont(StandardFonts.HelveticaBold);

      const rgbColor = (r: number, g: number, b: number) =>
        rgb(r / 255, g / 255, b / 255);
      const primaryColor = rgbColor(20, 30, 55); // Rich charcoal navy
      const lineDividerColor = rgbColor(230, 235, 245);
      const zebraColor = rgbColor(250, 252, 255);

      let page = walkListPdf.addPage([792, 612]);
      let y = 490;
      const rowHeight = 18;
      const maxRowsPerPage = 25;
      let rowCountOnPage = 0;
      let currentPageNum = 1;

      const drawHeader = (p: any, pageNum: number) => {
        // Top banner header
        p.drawText("PA BALLOT PRE-FILLER — WALKING CHECKLIST (LANDSCAPE)", {
          x: 35,
          y: 565,
          size: 13,
          font: fontBold,
          color: primaryColor,
        });

        const fileLabel = csvFile ? `  •  Source File: ${csvFile.name}` : "";
        p.drawText(
          `Compiled: ${new Date().toLocaleDateString()}  •  Batch Count: ${records.length} Voters  •  Page ${pageNum}${fileLabel}`,
          {
            x: 35,
            y: 550,
            size: 8.5,
            font: fontMedium,
            color: rgbColor(110, 120, 140),
          },
        );

        p.drawLine({
          start: { x: 35, y: 540 },
          end: { x: 757, y: 540 },
          thickness: 1.5,
          color: primaryColor,
        });

        // Table headers (landscape columns order: Num, Precinct, Voter Name, Registered Address, Age, Sex, Party, HHParty, Signed?)
        p.drawText("Num", {
          x: 40,
          y: 522,
          size: 8.5,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("Precinct", {
          x: 70,
          y: 522,
          size: 8.5,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("Voter Name", {
          x: 125,
          y: 522,
          size: 8.5,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("Registered Address (House, Street, Apt, Municipality)", {
          x: 260,
          y: 522,
          size: 8.5,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("Age", {
          x: 540,
          y: 522,
          size: 8.5,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("Sex", {
          x: 575,
          y: 522,
          size: 8.5,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("Party", {
          x: 605,
          y: 522,
          size: 8.5,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("HH Party", {
          x: 640,
          y: 522,
          size: 8.5,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("Signed?", {
          x: 730,
          y: 522,
          size: 8.5,
          font: fontBold,
          color: primaryColor,
        });

        p.drawLine({
          start: { x: 35, y: 512 },
          end: { x: 757, y: 512 },
          thickness: 1,
          color: rgbColor(180, 190, 205),
        });
      };

      drawHeader(page, currentPageNum);

      for (let i = 0; i < records.length; i++) {
        if (rowCountOnPage >= maxRowsPerPage) {
          page = walkListPdf.addPage([792, 612]);
          y = 490;
          rowCountOnPage = 0;
          currentPageNum++;
          drawHeader(page, currentPageNum);
        }

        const r = records[i];
        const fullName =
          `${r.First_Name || ""} ${r.Middle_Name ? r.Middle_Name + " " : ""}${r.Last_Name || ""} ${r.Suffix || ""}`
            .trim()
            .substring(0, 24);

        // Full Address: House, Street, Apt, City, State Zip
        const fullAddress =
          `${r.House__ || ""} ${r.StreetNameComplete || ""} ${r.Apt__ ? "#" + r.Apt__ : ""}, ${r.City || ""}, ${r.State || ""} ${r.Zip_Code || ""}`
            .trim()
            .substring(0, 60); // Landscape allows longer addresses!

        const age = String(r["RNCfiles.Age"] || "N/A");
        const sex = String(r.Sex || r.sex || "N/A").substring(0, 1); // Compact sex symbol
        const party = getPartyInitial(r["RNCfiles.OfficialParty"]);
        const hhParty = String(r.household_party || "N/A").substring(0, 18);
        const precinctVal = String(r.Precinct || "N/A").substring(0, 10);

        // Zebra rows
        if (i % 2 === 1) {
          page.drawRectangle({
            x: 35,
            y: y - 4,
            width: 722,
            height: rowHeight,
            color: zebraColor,
          });
        }

        // Draw cells (Landscape columns: Num, Precinct, Voter Name, Registered Address, Age, Sex, Party, HHParty, Signed?)
        page.drawText(String(i + 1), {
          x: 40,
          y: y,
          size: 7.5,
          font: fontMedium,
          color: rgbColor(100, 110, 130),
        });
        page.drawText(precinctVal, {
          x: 70,
          y: y,
          size: 7.5,
          font: fontMedium,
          color: rgbColor(80, 90, 110),
        });
        page.drawText(fullName, {
          x: 125,
          y: y,
          size: 7.5,
          font: fontBold,
          color: rgbColor(15, 23, 42),
        });
        page.drawText(fullAddress, {
          x: 260,
          y: y,
          size: 7.5,
          font: fontMedium,
          color: rgbColor(51, 65, 85),
        });
        page.drawText(age, {
          x: 540,
          y: y,
          size: 7.5,
          font: fontMedium,
          color: rgbColor(51, 65, 85),
        });
        page.drawText(sex, {
          x: 575,
          y: y,
          size: 7.5,
          font: fontMedium,
          color: rgbColor(51, 65, 85),
        });
        page.drawText(party, {
          x: 605,
          y: y,
          size: 7.5,
          font: fontMedium,
          color: rgbColor(51, 65, 85),
        });
        page.drawText(hhParty, {
          x: 640,
          y: y,
          size: 7.5,
          font: fontMedium,
          color: rgbColor(51, 65, 85),
        });

        // Draw checkbox square
        page.drawRectangle({
          x: 735,
          y: y - 1,
          width: 10,
          height: 10,
          borderColor: rgbColor(150, 160, 175),
          borderWidth: 1,
        });

        // Bottom border line
        page.drawLine({
          start: { x: 35, y: y - 4 },
          end: { x: 757, y: y - 4 },
          thickness: 0.5,
          color: lineDividerColor,
        });

        y -= rowHeight;
        rowCountOnPage++;
      }

      const pdfBytes = await walkListPdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.setAttribute(
        "download",
        `voter_walk_list_${new Date().toISOString().slice(0, 10)}.pdf`,
      );
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err: any) {
      alert(`Failed to compile Walking Checklist PDF: ${err.message}`);
    } finally {
      setIsGeneratingWalkList(false);
    }
  };

  const generatePDF = async (singleRecordIndex: number | null) => {
    setIsProcessing(true);
    setProgress(5);
    setStatusText("Downloading ballot PDF template into browser memory...");
    setValidationError(null);

    try {
      const isMailIn = applicationReason === "mail-in-voting";
      const templatePath = isMailIn
        ? "/PADOS_MailInApplication.pdf"
        : "/PADOS_Registration_Application.pdf";

      const response = await fetch(templatePath);
      if (!response.ok)
        throw new Error(
          `Official Pennsylvania ${isMailIn ? "Mail-In" : "Registration"} PDF template could not be loaded.`,
        );
      const templateBytes = await response.arrayBuffer();

      const batchPdf = await PDFDocument.create();
      const recordsToProcess =
        singleRecordIndex !== null ? [records[singleRecordIndex]] : records;
      const total = recordsToProcess.length;

      for (let i = 0; i < total; i++) {
        const record = recordsToProcess[i];
        const name =
          `${record.first_name || ""} ${record.last_name || ""}`.trim() ||
          `Record #${i + 1}`;

        setStatusText(`Filling out application ${i + 1} of ${total}: ${name}`);
        setProgress(Math.round((i / total) * 90) + 5);

        // Load a temporary instance of the template, modify it, and copy it
        const tempDoc = await PDFDocument.load(templateBytes);
        tempDoc.registerFontkit(fontkit);

        // Embed the custom Inter-Medium font if loaded; fallback to standard Helvetica-Bold
        const fontMedium = mediumFontBytes
          ? await tempDoc.embedFont(mediumFontBytes)
          : await tempDoc.embedFont(StandardFonts.HelveticaBold);

        const fontBold = await tempDoc.embedFont(StandardFonts.HelveticaBold);

        // Dark rich ballot-safe blue ink
        const bluePenColor = rgb(0.08, 0.22, 0.58);

        // Map every text field in the record
        Object.keys(coords).forEach((key) => {
          // Skip printing the state on the PDF template since 'PA' is already prefilled/printed.
          if (key === "state") return;

          // Skip qualifications, gender, party choice, and requires_assistance (handled customly)
          if (
            key === "is_citizen" ||
            key === "is_at_least_18" ||
            key === "gender" ||
            key === "party_choice" ||
            key === "requires_assistance"
          ) {
            return;
          }

          // Skip printing Date of Birth and Phone unless the toggle is enabled
          if (!printDobAndPhone && (key === "birthdate" || key === "phone")) {
            return;
          }

          const field = coords[key];
          let val = record[key];

          // Concatenate previous address fields for single consolidated line on Section 9
          if (key === "prev_full_address") {
            const parts = [
              record.prev_address || record.Prev_Address || "",
              record.prev_city || record.Prev_City || "",
              record.prev_state || record.Prev_State || "",
              record.prev_zip || record.Prev_Zip || "",
              record.prev_county || record.Prev_County
                ? (record.prev_county || record.Prev_County) + " County"
                : "",
            ].filter((p) => p && String(p).trim() !== "");
            val = parts.join(", ");
          }

          // Limit assistance_reason to 25 characters and skip if requires_assistance is not yes
          if (key === "assistance_reason") {
            const assistVal = String(record.requires_assistance || "")
              .trim()
              .toLowerCase();
            if (assistVal !== "yes") return;
            val = String(val).substring(0, 25);
          }

          // Fetch the page based on pageIndex (default to 0 for first page)
          const pageIndex = field.pageIndex ?? 0;
          const targetPage =
            tempDoc.getPages()[pageIndex] || tempDoc.getPages()[0];

          if (field.type === "text" && val && String(val).trim() !== "") {
            targetPage.drawText(String(val).trim(), {
              x: field.x,
              y: field.y,
              size: 12,
              font: fontMedium,
              color: bluePenColor,
            });
          }
        });

        // First page object for checkbox overlays
        const firstPage = tempDoc.getPages()[0];

        // Specialized Suffix Checkbox Logic (Only for Mail-in form!)
        if (isMailIn) {
          // Support string, array of strings, or comma/space separated values.
          // The values printed with coordinates are JR, SR, III, and IV only.
          const parseSuffixes = (val: any): string[] => {
            if (!val) return [];
            if (Array.isArray(val)) {
              return val
                .map((v) => String(v).trim().toUpperCase().replace(/\./g, ""))
                .filter((v) => ["JR", "SR", "III", "IV"].includes(v));
            }
            return String(val)
              .split(/[\s,]+/)
              .map((v) => v.trim().toUpperCase().replace(/\./g, ""))
              .filter((v) => ["JR", "SR", "III", "IV"].includes(v));
          };

          const activeSuffixes = parseSuffixes(record.suffix);

          if (activeSuffixes.includes("JR")) {
            const field = coords.suffix_jr || { x: 414, y: 706 };
            firstPage.drawCircle({
              x: field.x,
              y: field.y,
              size: 7,
              borderColor: bluePenColor,
              borderWidth: 1.5,
            });
          }
          if (activeSuffixes.includes("SR")) {
            const field = coords.suffix_sr || { x: 432, y: 706 };
            firstPage.drawCircle({
              x: field.x,
              y: field.y,
              size: 7,
              borderColor: bluePenColor,
              borderWidth: 1.5,
            });
          }
          if (activeSuffixes.includes("III")) {
            const field = coords.suffix_iii || { x: 462, y: 706 };
            firstPage.drawCircle({
              x: field.x,
              y: field.y,
              size: 7,
              borderColor: bluePenColor,
              borderWidth: 1.5,
            });
          }
          if (activeSuffixes.includes("IV")) {
            const field = coords.suffix_iv || { x: 480, y: 706 };
            firstPage.drawCircle({
              x: field.x,
              y: field.y,
              size: 7,
              borderColor: bluePenColor,
              borderWidth: 1.5,
            });
          }
        }

        // Specialized Checkbox Logic: Section 4 / Section 6 - Same as Above
        const mailingAddress = record.mailing_address
          ? String(record.mailing_address).trim()
          : "";
        const hasMailing = mailingAddress.length > 0;

        if (!hasMailing) {
          // Check "Same as above" box in Section 4 (Coordinates: X: 190, Y: 468 for Mail-In; X: 189, Y: 423 for Registration)
          const sameAsAboveX = isMailIn ? 190 : 189;
          const sameAsAboveY = isMailIn ? 468 : 423;
          firstPage.drawText("X", {
            x: sameAsAboveX,
            y: sameAsAboveY,
            size: 11,
            font: fontBold,
            color: bluePenColor,
          });
        }

        // Section 7 - Annual Mail-in request (Always True, only for Mail-In!)
        if (isMailIn) {
          const annualField = coords.annual_request || { x: 190, y: 208 };
          firstPage.drawText("X", {
            x: annualField.x,
            y: annualField.y,
            size: 11.5,
            font: fontBold,
            color: bluePenColor,
          });
        }

        // 8. Eligibility Checkboxes (Section 2 - Registration Only)
        if (!isMailIn) {
          if (record.is_citizen === "yes" || record.is_citizen === "YES") {
            const field = coords.is_citizen_yes || { x: 304, y: 652 };
            firstPage.drawText("X", {
              x: field.x,
              y: field.y,
              size: 11,
              font: fontBold,
              color: bluePenColor,
            });
          } else if (record.is_citizen === "no" || record.is_citizen === "NO") {
            const field = coords.is_citizen_no || { x: 340, y: 652 };
            firstPage.drawText("X", {
              x: field.x,
              y: field.y,
              size: 11,
              font: fontBold,
              color: bluePenColor,
            });
          }

          if (
            record.is_at_least_18 === "yes" ||
            record.is_at_least_18 === "YES"
          ) {
            const field = coords.is_at_least_18_yes || { x: 304, y: 632 };
            firstPage.drawText("X", {
              x: field.x,
              y: field.y,
              size: 11,
              font: fontBold,
              color: bluePenColor,
            });
          } else if (
            record.is_at_least_18 === "no" ||
            record.is_at_least_18 === "NO"
          ) {
            const field = coords.is_at_least_18_no || { x: 340, y: 632 };
            firstPage.drawText("X", {
              x: field.x,
              y: field.y,
              size: 11,
              font: fontBold,
              color: bluePenColor,
            });
          }
        }

        // 9. Reason Checkboxes (Section 3 - Registration Only)
        if (!isMailIn) {
          let reasonX = 0;
          let reasonY = 604.6;
          if (applicationReason === "new-registration") {
            reasonX = 189;
          } else if (applicationReason === "mail-in-voting") {
            reasonX = 288;
          } else if (applicationReason === "name-change") {
            reasonX = 375;
          } else if (applicationReason === "address-change") {
            reasonX = 477;
          } else if (applicationReason === "party-change") {
            reasonX = 189;
            reasonY = 593.1;
          } else if (applicationReason === "federal-military") {
            reasonX = 288;
            reasonY = 593.1;
          }

          if (reasonX > 0) {
            firstPage.drawText("X", {
              x: reasonX,
              y: reasonY,
              size: 11,
              font: fontBold,
              color: bluePenColor,
            });
          }
        }

        // 10. Gender Checkboxes (Section 4 - Registration Only)
        if (!isMailIn && record.gender) {
          const genderVal = String(record.gender).trim().toUpperCase();
          let genderX = 0;
          if (genderVal.includes("FEMALE") || genderVal === "F") {
            genderX = 233;
          } else if (genderVal.includes("MALE") || genderVal === "M") {
            genderX = 303;
          } else if (
            genderVal.includes("NON-BINARY") ||
            genderVal.includes("OTHER") ||
            genderVal === "X"
          ) {
            genderX = 366;
          }

          if (genderX > 0) {
            firstPage.drawText("X", {
              x: genderX,
              y: 529,
              size: 11,
              font: fontBold,
              color: bluePenColor,
            });
          }
        }

        // 11. Political Party Checkboxes (Section 8 - Registration Only)
        if (!isMailIn && record.party_choice) {
          const partyVal = String(record.party_choice).trim().toUpperCase();
          let partyX = 0;
          let partyY = 310;

          if (
            partyVal.includes("DEMOCRATIC") ||
            partyVal === "D" ||
            partyVal === "DEM"
          ) {
            // For positioning Democrat Checkbox
            // partyX = 188;
            // Hardcode Democrat position to Republican
            partyX = 263;
          } else if (
            partyVal.includes("REPUBLICAN") ||
            partyVal === "R" ||
            partyVal === "REP"
          ) {
            partyX = 263;
          } else if (partyVal.includes("GREEN") || partyVal === "G") {
            partyX = 337;
          } else if (partyVal.includes("LIBERTARIAN") || partyVal === "L") {
            partyX = 391;
          } else if (partyVal.includes("OTHER") || partyVal === "OTHER") {
            partyX = 188;
            partyY = 290;
          }

          if (partyX > 0) {
            firstPage.drawText("X", {
              x: partyX,
              y: partyY,
              size: 11,
              font: fontBold,
              color: bluePenColor,
            });
          }
        }

        // 12. Section 12 Mail-In Ballot Check (Default Option 2 - Registration Only)
        if (!isMailIn) {
          const secondPage = tempDoc.getPages()[1];
          if (secondPage) {
            secondPage.drawText("X", {
              x: 189,
              y: 643.5,
              size: 11,
              font: fontBold,
              color: bluePenColor,
            });
          }
        }

        // 13. Section 1.5 ID Checkbox (I do not have either, Registration Only)
        if (!isMailIn && record.id_type === "none") {
          firstPage.drawText("X", {
            x: 189,
            y: 338,
            size: 11,
            font: fontBold,
            color: bluePenColor,
          });
        }

        // 14. Section 10 Voting Assistance YES Checkbox (Page 1, Registration Only)
        if (!isMailIn && record.requires_assistance === "yes") {
          firstPage.drawText("X", {
            x: 188,
            y: 159,
            size: 11,
            font: fontBold,
            color: bluePenColor,
          });
        }

        // Copy all modified template pages (natively supporting multi-page formats)
        const pageCount = tempDoc.getPageCount();
        const pagesToCopy = Array.from({ length: pageCount }, (_, idx) => idx);
        const copiedPages = await batchPdf.copyPages(tempDoc, pagesToCopy);
        copiedPages.forEach((copiedPage) => {
          batchPdf.addPage(copiedPage);
        });

        // A tiny delay to let the UI thread breathe
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      setStatusText("Assembling multi-page ballot batch file...");
      setProgress(95);

      const batchBytes = await batchPdf.save();
      const blob = new Blob([batchBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setGeneratedBlobUrl(url);
      setProgress(100);
      setIsSuccess(true);

      // Programmatic auto-download of the completed file
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.setAttribute(
        "download",
        `pa_ballot_applications_batch_${recordsToProcess.length}_records.pdf`,
      );
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err: any) {
      setValidationError(`Engine processing failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl shadow-sm flex items-start gap-3">
          <div className="p-1 bg-rose-100 rounded text-rose-800 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-grow">
            <h4 className="font-semibold text-sm">Processing Error</h4>
            <p className="text-xs mt-0.5 leading-relaxed">{validationError}</p>
            {missingHeaders.length > 0 && (
              <div className="mt-2">
                <span className="text-xs font-semibold">
                  Missing Headers Checklist:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {missingHeaders.map((h) => (
                    <span
                      key={h}
                      className="bg-rose-100 border border-rose-200 text-rose-700 px-2 py-0.5 rounded text-[10px] font-mono"
                    >
                      ⚠️ {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Upload Control */}
        <div className="lg:col-span-2 space-y-6">
          {/* TABS SELECTOR */}
          <div className="flex space-x-1 bg-slate-200/60 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "upload"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Upload Center
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "manual"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📝 Single Manual Entry
            </button>
            {records.length > 0 && (
              <>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "preview"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Voter Applications ({records.length})
                </button>
                <button
                  onClick={() => setActiveTab("walklist")}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "walklist"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🚶 Walking Checklist
                </button>
              </>
            )}
          </div>

          {/* TAB 1.5: MANUAL FORM FILLER */}
          {activeTab === "manual" && (
            <NewResidentsForm
              mediumFontBytes={mediumFontBytes}
              applicationReason={applicationReason}
              coords={coords}
              handleCoordinateChange={handleCoordinateChange}
              resetCoordinates={resetCoordinates}
            />
          )}

          {/* TAB 1: UPLOAD BOX */}
          {activeTab === "upload" && (
            <CsvUploadCenter
              csvFile={csvFile}
              records={records}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              processCSV={processCSV}
              clearFile={clearFile}
            />
          )}

          {/* TAB 2: DATA TABLE PREVIEW */}
          {activeTab === "preview" && (
            <VoterApplicationsList
              records={records}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              generatePDF={generatePDF}
              isProcessing={isProcessing}
              clearFile={clearFile}
            />
          )}

          {/* TAB 3: WALKING CHECKLIST */}
          {activeTab === "walklist" && (
            <WalkingChecklist
              records={records}
              csvFile={csvFile}
              isGeneratingWalkList={isGeneratingWalkList}
              generateWalkListPDF={generateWalkListPDF}
              getPartyInitial={getPartyInitial}
            />
          )}
        </div>

        {/* RIGHT COLUMN: Instructions, coordinates & progress */}
        <div className="space-y-6">
          {/* PROCESSING STATE LOADER */}
          {isProcessing && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  Generating Batch PDF
                </span>
                <span className="text-xs font-mono text-blue-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 animate-pulse">
                {statusText}
              </p>
            </div>
          )}

          {/* SUCCESS STATUS */}
          {isSuccess && generatedBlobUrl && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Batch Compilation Complete
              </div>
              <p className="text-[10px] text-emerald-700 leading-relaxed">
                All voter records have been successfully embedded onto
                individual ballot applications and merged into a single
                multi-page PDF document.
              </p>
              <div className="flex gap-2">
                <a
                  href={generatedBlobUrl}
                  download={`pa_ballot_applications_batch_${records.length}_records.pdf`}
                  className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" /> Re-download Batch
                </a>
              </div>
            </div>
          )}

          {/* BATCH ACTION CONTAINER */}
          {records.length > 0 && !isProcessing && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center space-y-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full w-fit mx-auto">
                <Printer className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Trigger Consolidated Batch Print
                </h4>
                <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">
                  Merge all {records.length} voter records onto the PA Ballot
                  Application template and download a single multi-page file.
                </p>
              </div>

              {/* PRIVACY TOGGLE OPTIONS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <input
                    id="toggle-dob-phone"
                    type="checkbox"
                    checked={printDobAndPhone}
                    onChange={(e) => setPrintDobAndPhone(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 h-4 w-4 cursor-pointer"
                  />
                  <label
                    htmlFor="toggle-dob-phone"
                    className="text-[11px] font-bold text-slate-700 cursor-pointer select-none leading-tight"
                  >
                    Print Date of Birth & Phone Number
                    <span className="block text-[10px] text-slate-400 font-normal mt-1 leading-relaxed">
                      By default, DOB and Phone are excluded to protect voter
                      privacy. Toggle to include these pre-filled values on the
                      PDF.
                    </span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => generatePDF(null)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Compile and Download Batch PDF ({records.length} Pages)
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* WORKFLOW GUIDE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-3">
              <FileText className="h-4.5 w-4.5 text-blue-600" />
              Workflow Instructions
            </h3>
            <ol className="space-y-3.5 text-xs text-slate-600 list-decimal pl-4.5">
              <li>
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="text-blue-600 hover:underline font-semibold text-left focus:outline-none"
                >
                  Download the sample voter CSV template
                </button>{" "}
                to check the required column mapping structure.
              </li>
              <li>
                Ensure your voter spreadsheet has the mandatory columns (e.g.,{" "}
                <code>last_name</code>, <code>first_name</code>,{" "}
                <code>address</code>, <code>birthdate</code>, etc.).
              </li>
              <li>
                Upload your CSV file. The browser will run auto schema
                validation on columns and records.
              </li>
              <li>
                Review individual rows in the preview tab, then trigger the{" "}
                <strong>batch generation button</strong> to print all
                applications.
              </li>
            </ol>
            <button
              type="button"
              onClick={downloadSampleCSV}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-semibold hover:bg-slate-50 transition-colors text-center"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 inline-block align-middle" />
              <span className="ml-1.5 align-middle">
                Download Sample CSV Template
              </span>
            </button>
          </div>

          {/* ADVANCED COORDINATES TUNER */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setShowCoordsEditor(!showCoordsEditor)}
              className="w-full flex justify-between items-center p-5 bg-white border-b border-transparent font-bold text-slate-900 text-xs hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <span className="flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-blue-600" />
                Fine-tune Application Alignment (Advanced)
              </span>
              <span className="text-xs text-blue-600">
                {showCoordsEditor ? "Hide Panel" : "Open Panel"}
              </span>
            </button>

            {showCoordsEditor && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Adjust text alignment coordinates in PDF points. Origin{" "}
                  <span className="font-semibold">(0,0)</span> is at the{" "}
                  <strong>bottom-left</strong> of standard Letter size (612 x
                  792 points). Changes apply immediately to generating sheets.
                </p>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] font-bold text-slate-700">
                    Database Fields Coordinate Mapping
                  </span>
                  <button
                    type="button"
                    onClick={resetCoordinates}
                    className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 hover:underline"
                  >
                    Reset Map
                  </button>
                </div>

                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {Object.keys(coords).map((key) => {
                    const item = coords[key];
                    return (
                      <div
                        key={key}
                        className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs space-y-2 text-[11px]"
                      >
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{item.label}</span>
                          <span className="font-mono text-slate-400 text-[10px] flex items-center gap-1.5">
                            {item.pageIndex !== undefined && (
                              <span className="bg-slate-100 text-slate-600 px-1 rounded text-[8px]">
                                PG {item.pageIndex + 1}
                              </span>
                            )}
                            {key}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-bold">X:</span>
                            <input
                              type="number"
                              value={item.x}
                              onChange={(e) =>
                                handleCoordinateChange(
                                  key,
                                  "x",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-bold">Y:</span>
                            <input
                              type="number"
                              value={item.y}
                              onChange={(e) =>
                                handleCoordinateChange(
                                  key,
                                  "y",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
