import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Printer,
  Settings,
  FileText,
  X,
} from "lucide-react";
import NewResidentsForm from "./NewResidentsForm";

interface FieldCoord {
  name: string;
  label: string;
  x: number;
  y: number;
  type: "text" | "checkbox";
  pageIndex?: number;
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

export default function CsvBatchPrinter({
  coords,
  resetCoordinates,
  handleCoordinateChange,
  mediumFontBytes,
  pdfTemplateLoaded,
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

  // Diagnostic State Logger
  useEffect(() => {
    console.log("=== CsvBatchPrinter State Update ===");
    console.log("csvFile State:", csvFile ? csvFile.name : "null");
    console.log("records count State:", records.length);
    console.log("activeTab State:", activeTab);
    console.log("validationError State:", validationError);
  }, [csvFile, records, activeTab, validationError]);

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

        console.log("=== CSV PARSING STARTED ===");
        console.log("File Name:", file.name);
        console.log("Parsed Headers from File:", headers);
        console.log("Required Headers Checklist:", requiredHeaders);

        // Find missing headers (case sensitive checklist)
        const missing = requiredHeaders.filter((h) => !headers.includes(h));

        console.log("Missing Headers Found:", missing);

        if (missing.length > 0) {
          console.error("CSV Aborted: Missing required columns:", missing);
          setMissingHeaders(missing);
          setValidationError(
            `The CSV is missing ${missing.length} required field columns.`,
          );
          return;
        }

        const rawData = results.data;
        console.log("Raw parsed records count:", rawData.length);

        if (rawData.length === 0) {
          console.error("CSV Aborted: No records found in file.");
          setValidationError(
            "The CSV file does not contain any voter records.",
          );
          return;
        }

        if (rawData.length > 500) {
          console.error(
            "CSV Aborted: Record count is over 500 cap:",
            rawData.length,
          );
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

        console.log("=== MAPPING AND SORTING COMPLETE ===");
        console.log("Mapped Records:", mappedData.length);
        console.log("Sorted Records:", sortedData.length);
        console.log("Sample First Sorted Record:", sortedData[0]);

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
    let headers = [
      "First_Name",
      "Middle_Name",
      "Last_Name",
      "Suffix",
      "Date_Of_Birth",
      "House__",
      "StreetNameComplete",
      "Apt__",
      "City",
      "State",
      "Zip_Code",
      "MAddress_Line_1",
      "MAddress_Line_2",
      "MCity",
      "MState",
      "MZip_Code",
      "PollingPlaceDescript",
      "Ward",
      "RNCfiles.PrimaryPhone",
      "Voter_Status",
    ];

    // Add optional headers for specific purposes
    const extraHeaders: string[] = [
      "Precinct",
      "Sex",
      "RNCfiles.OfficialParty",
      "RNCfiles.Age",
    ];

    let rows: string[][] = [];
    let filename = "";

    if (applicationReason === "mail-in-voting") {
      filename = "mailin_ballots_sample.csv";
      headers = [...headers, "VBM.AppType", ...extraHeaders];
      rows = [
        [
          "John",
          "Robert",
          "Doe",
          "JR",
          "11/04/1984",
          "123",
          "Main St",
          "",
          "Norristown",
          "PA",
          "19401",
          "",
          "",
          "",
          "",
          "",
          "Norristown Library",
          "Ward 1",
          "555-0199",
          "Active",
          "Annual",
          "Precinct 4",
          "M",
          "REP",
          "41",
        ],
        [
          "Jane",
          "Marie",
          "Smith",
          "",
          "08/24/1990",
          "456",
          "Maple Ave",
          "Apt 2B",
          "West Chester",
          "PA",
          "19380",
          "P.O. Box 789",
          "",
          "Harrisburg",
          "PA",
          "17101",
          "West Chester Fire Station",
          "Ward 3",
          "555-0144",
          "Active",
          "Annual",
          "Precinct 12",
          "F",
          "DEM",
          "35",
        ],
      ];
    } else if (applicationReason === "new-registration") {
      filename = "new_voter_registration_sample.csv";
      headers = [...headers, ...extraHeaders];
      rows = [
        [
          "Alice",
          "Elizabeth",
          "Voter",
          "",
          "05/12/2004",
          "789",
          "Pine Rd",
          "",
          "Reading",
          "PA",
          "19601",
          "",
          "",
          "",
          "",
          "",
          "Reading High School",
          "Ward 2",
          "555-0211",
          "Active",
          "Precinct 5",
          "F",
          "DEM",
          "22",
        ],
        [
          "Bob",
          "James",
          "Newcomer",
          "",
          "12/15/1995",
          "101",
          "Oak Ln",
          "",
          "Media",
          "PA",
          "19063",
          "",
          "",
          "",
          "",
          "",
          "Media Borough Hall",
          "Ward 1",
          "555-0288",
          "Active",
          "Precinct 1",
          "M",
          "REP",
          "30",
        ],
      ];
    } else if (applicationReason === "address-change") {
      filename = "change_of_address_sample.csv";
      headers = [
        ...headers,
        "Prev_Address",
        "Prev_City",
        "Prev_State",
        "Prev_Zip",
        "Prev_County",
        ...extraHeaders,
      ];
      rows = [
        [
          "David",
          "Michael",
          "Student",
          "",
          "09/18/2005",
          "200",
          "University Pkwy",
          "Dorm 304B",
          "West Chester",
          "PA",
          "19383",
          "",
          "",
          "",
          "",
          "",
          "Hollinger Fieldhouse",
          "Ward 2",
          "555-0322",
          "Active",
          "50 Main St",
          "Allentown",
          "PA",
          "18101",
          "Lehigh",
          "Precinct 8",
          "M",
          "DEM",
          "20",
        ],
        [
          "Emma",
          "Grace",
          "Mover",
          "",
          "02/10/1992",
          "456",
          "New Spruce St",
          "",
          "Norristown",
          "PA",
          "19401",
          "",
          "",
          "",
          "",
          "",
          "Norristown High School",
          "Ward 4",
          "555-0344",
          "Active",
          "789 Old Elm St",
          "Reading",
          "PA",
          "19601",
          "Berks",
          "Precinct 10",
          "F",
          "REP",
          "34",
        ],
      ];
    } else if (applicationReason === "name-change") {
      filename = "change_of_name_sample.csv";
      headers = [...headers, "Prev_Name", ...extraHeaders];
      rows = [
        [
          "Sarah",
          "Lynn",
          "Miller",
          "",
          "06/30/1988",
          "789",
          "Valley Rd",
          "",
          "West Chester",
          "PA",
          "19382",
          "",
          "",
          "",
          "",
          "",
          "West Chester Community Center",
          "Ward 1",
          "555-0455",
          "Active",
          "Sarah Lynn Smith",
          "Precinct 3",
          "F",
          "DEM",
          "37",
        ],
      ];
    } else if (applicationReason === "party-change") {
      filename = "change_of_party_sample.csv";
      headers = [...headers, ...extraHeaders];
      rows = [
        [
          "Kevin",
          "Andrew",
          "Voter",
          "",
          "10/05/1978",
          "321",
          "Birch Blvd",
          "",
          "Reading",
          "PA",
          "19605",
          "",
          "",
          "",
          "",
          "",
          "Reading Recreation Center",
          "Ward 5",
          "555-0566",
          "Active",
          "Precinct 9",
          "M",
          "REP",
          "47",
        ],
      ];
    } else if (applicationReason === "federal-military") {
      filename = "federal_military_sample.csv";
      headers = [...headers, ...extraHeaders];
      rows = [
        [
          "Mark",
          "Steven",
          "Patriot",
          "",
          "07/04/1980",
          "1776",
          "Liberty Way",
          "",
          "Norristown",
          "PA",
          "19403",
          "APO AP 96326",
          "",
          "",
          "",
          "",
          "Norristown Library",
          "Ward 1",
          "555-0776",
          "Active",
          "Precinct 2",
          "M",
          "REP",
          "45",
        ],
      ];
    } else {
      filename = "voter_database_sample.csv";
      headers = [...headers, ...extraHeaders];
      rows = [
        [
          "John",
          "Robert",
          "Doe",
          "JR",
          "11/04/1984",
          "123",
          "Main St",
          "",
          "Norristown",
          "PA",
          "19401",
          "",
          "",
          "",
          "",
          "",
          "Norristown Library",
          "Ward 1",
          "555-0199",
          "Active",
          "Precinct 4",
          "M",
          "REP",
          "41",
        ],
      ];
    }

    // Build CSV text string escaping double quotes if necessary
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const cellStr = String(cell);
            return cellStr.includes(",") || cellStr.includes('"')
              ? `"${cellStr.replace(/"/g, '""')}"`
              : cellStr;
          })
          .join(","),
      ),
    ].join("\n");

    // Create Blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
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

      let page = walkListPdf.addPage([612, 792]);
      let y = 675;
      const rowHeight = 22;
      const maxRowsPerPage = 27;
      let rowCountOnPage = 0;
      let currentPageNum = 1;

      const drawHeader = (p: any, pageNum: number) => {
        // Top banner header
        p.drawText("PA BALLOT PRE-FILLER — WALKING CHECKLIST", {
          x: 40,
          y: 745,
          size: 13,
          font: fontBold,
          color: primaryColor,
        });

        p.drawText(
          `Compiled: ${new Date().toLocaleDateString()}  •  Batch Count: ${records.length} Voters  •  Page ${pageNum}`,
          {
            x: 40,
            y: 730,
            size: 9,
            font: fontMedium,
            color: rgbColor(110, 120, 140),
          },
        );

        p.drawLine({
          start: { x: 40, y: 720 },
          end: { x: 572, y: 720 },
          thickness: 1.5,
          color: primaryColor,
        });

        // Table headers
        p.drawText("Num", {
          x: 45,
          y: 702,
          size: 9,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("Voter Name", {
          x: 80,
          y: 702,
          size: 9,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("Registered Address (Walk Order)", {
          x: 220,
          y: 702,
          size: 9,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("Age", {
          x: 420,
          y: 702,
          size: 9,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("Sex", {
          x: 450,
          y: 702,
          size: 9,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("Party", {
          x: 485,
          y: 702,
          size: 9,
          font: fontBold,
          color: primaryColor,
        });
        p.drawText("Signed?", {
          x: 530,
          y: 702,
          size: 9,
          font: fontBold,
          color: primaryColor,
        });

        p.drawLine({
          start: { x: 40, y: 692 },
          end: { x: 572, y: 692 },
          thickness: 1,
          color: rgbColor(180, 190, 205),
        });
      };

      drawHeader(page, currentPageNum);

      for (let i = 0; i < records.length; i++) {
        if (rowCountOnPage >= maxRowsPerPage) {
          page = walkListPdf.addPage([612, 792]);
          y = 675;
          rowCountOnPage = 0;
          currentPageNum++;
          drawHeader(page, currentPageNum);
        }

        const r = records[i];
        const fullName =
          `${r.First_Name || ""} ${r.Middle_Name ? r.Middle_Name + " " : ""}${r.Last_Name || ""} ${r.Suffix || ""}`
            .trim()
            .substring(0, 24);
        const fullAddress =
          `${r.House__ || ""} ${r.StreetNameComplete || ""} ${r.Apt__ ? "#" + r.Apt__ : ""}, ${r.City || ""}`
            .trim()
            .substring(0, 40);
        const age = String(r["RNCfiles.Age"] || "N/A");
        const sex = String(r.Sex || r.sex || "N/A").substring(0, 3);
        const party = getPartyInitial(r["RNCfiles.OfficialParty"]);

        // Zebra rows
        if (i % 2 === 1) {
          page.drawRectangle({
            x: 40,
            y: y - 4,
            width: 532,
            height: rowHeight,
            color: zebraColor,
          });
        }

        page.drawText(String(i + 1), {
          x: 45,
          y: y,
          size: 8,
          font: fontMedium,
          color: rgbColor(100, 110, 130),
        });
        page.drawText(fullName, {
          x: 80,
          y: y,
          size: 8,
          font: fontBold,
          color: rgbColor(15, 23, 42),
        });
        page.drawText(fullAddress, {
          x: 220,
          y: y,
          size: 8,
          font: fontMedium,
          color: rgbColor(51, 65, 85),
        });
        page.drawText(age, {
          x: 420,
          y: y,
          size: 8,
          font: fontMedium,
          color: rgbColor(51, 65, 85),
        });
        page.drawText(sex, {
          x: 450,
          y: y,
          size: 8,
          font: fontMedium,
          color: rgbColor(51, 65, 85),
        });
        page.drawText(party, {
          x: 485,
          y: y,
          size: 8,
          font: fontMedium,
          color: rgbColor(51, 65, 85),
        });

        // Draw checkbox square
        page.drawRectangle({
          x: 535,
          y: y - 1,
          width: 10,
          height: 10,
          borderColor: rgbColor(150, 160, 175),
          borderWidth: 1,
        });

        // Bottom border line
        page.drawLine({
          start: { x: 40, y: y - 4 },
          end: { x: 572, y: y - 4 },
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
      alert(`Error compiling walk list PDF: ${err.message}`);
    } finally {
      setIsGeneratingWalkList(false);
    }
  };

  const generatePDF = async (singleRecordIndex: number | null = null) => {
    if (pdfTemplateLoaded === false) {
      alert(
        'Cannot generate PDF: The application template "PADOS_MailInApplication.pdf" was not found in the public folder. Please verify installation.',
      );
      return;
    }

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

          // Skip printing Date of Birth and Phone unless the toggle is enabled
          if (!printDobAndPhone && (key === "birthdate" || key === "phone")) {
            return;
          }

          const field = coords[key];
          const val = record[key];

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

        // Specialized Suffix Checkbox Logic
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

        // Specialized Checkbox Logic: Section 4 - Same as Above
        const mailingAddress = record.mailing_address
          ? String(record.mailing_address).trim()
          : "";
        const hasMailing = mailingAddress.length > 0;

        if (!hasMailing) {
          // Check "Same as above" box in Section 4 (Coordinates: X: 190, Y: 468 for Mail-In; X: 262, Y: 428 for Registration)
          const sameAsAboveX = isMailIn ? 190 : 262;
          const sameAsAboveY = isMailIn ? 468 : 428;
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center">
              <label
                htmlFor="voter-csv-upload"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="w-full max-w-lg border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-blue-500 hover:bg-slate-50/50 transition-all cursor-pointer flex flex-col items-center group"
              >
                <div className="p-4 bg-blue-50 rounded-full text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8" />
                </div>

                <h4 className="text-slate-900 font-bold text-base">
                  Drag & Drop Your Voter CSV
                </h4>
                <p className="text-slate-500 text-xs mt-1 max-w-xs">
                  Supports <code>.csv</code> spreadsheet format. Auto schema
                  verification inside browser.
                </p>

                <div className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
                  Select File From Device
                </div>

                <input
                  id="voter-csv-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, text/csv, application/csv, application/vnd.ms-excel"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      processCSV(e.target.files[0]);
                    }
                  }}
                />
              </label>

              {csvFile && (
                <div className="mt-6 flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-left w-full max-w-lg">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h5 className="font-bold text-slate-900 text-xs truncate">
                      {csvFile.name}
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      {(csvFile.size / 1024).toFixed(1)} KB • {records.length}{" "}
                      records parsed
                    </p>
                  </div>
                  <button
                    onClick={clearFile}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DATA TABLE PREVIEW */}
          {activeTab === "preview" &&
            (() => {
              const totalRecords = records.length;
              const totalPages = Math.ceil(totalRecords / rowsPerPage);
              const startIndex = (currentPage - 1) * rowsPerPage;
              const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
              const paginatedRecords = records.slice(startIndex, endIndex);

              return (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        Voter Record Listing
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Verified schema rows parsed safely in memory.
                      </p>
                    </div>
                    <button
                      onClick={clearFile}
                      className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Clear Dataset
                    </button>
                  </div>

                  <div className="overflow-x-auto max-h-[440px]">
                    <table className="w-full text-left text-[11px] text-slate-600">
                      <thead className="bg-slate-100 text-[10px] text-slate-700 uppercase font-bold tracking-wider sticky top-0">
                        <tr>
                          <th className="px-4 py-3 border-b border-slate-200">
                            #
                          </th>
                          <th className="px-4 py-3 border-b border-slate-200">
                            Voter Name
                          </th>
                          <th className="px-4 py-3 border-b border-slate-200">
                            Age
                          </th>
                          <th className="px-4 py-3 border-b border-slate-200">
                            Party
                          </th>
                          <th className="px-4 py-3 border-b border-slate-200">
                            Address
                          </th>
                          <th className="px-4 py-3 border-b border-slate-200">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedRecords.map((r, index) => {
                          const idx = startIndex + index;
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2.5 font-mono text-slate-400">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-slate-900">
                                {r.first_name} {r.last_name}
                              </td>
                              <td className="px-4 py-2.5 font-medium">
                                {r["RNCfiles.Age"] || "N/A"}
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    String(r["RNCfiles.OfficialParty"])
                                      .toLowerCase()
                                      .includes("dem")
                                      ? "bg-blue-50 border-blue-100 text-blue-700"
                                      : String(r["RNCfiles.OfficialParty"])
                                            .toLowerCase()
                                            .includes("rep")
                                        ? "bg-red-50 border-red-100 text-red-700"
                                        : "bg-slate-50 border-slate-100 text-slate-600"
                                  }`}
                                >
                                  {r["RNCfiles.OfficialParty"] || "N/A"}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 max-w-xs truncate">
                                {r.address}, {r.city}
                              </td>
                              <td className="px-4 py-2.5">
                                <button
                                  onClick={() => generatePDF(idx)}
                                  disabled={isProcessing}
                                  className="text-blue-600 font-bold hover:underline"
                                >
                                  Download Single
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION CONTROLS */}
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs select-none">
                    <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                      <span>Show</span>
                      <select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value) || 25);
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none font-semibold text-slate-700 cursor-pointer"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>records per page</span>
                      <span className="mx-2 text-slate-350">|</span>
                      <span>
                        Showing{" "}
                        <strong className="text-slate-800 font-bold">
                          {startIndex + 1}
                        </strong>{" "}
                        to{" "}
                        <strong className="text-slate-800 font-bold">
                          {endIndex}
                        </strong>{" "}
                        of{" "}
                        <strong className="text-slate-800 font-bold">
                          {totalRecords}
                        </strong>{" "}
                        entries
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs transition-colors disabled:opacity-40"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1,
                        )
                        .map((page, index, array) => {
                          const showEllipses =
                            index > 0 && page - array[index - 1] > 1;
                          return (
                            <div key={page} className="flex items-center gap-1">
                              {showEllipses && (
                                <span className="text-slate-400 px-1 font-normal">
                                  ...
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                                  currentPage === page
                                    ? "bg-blue-600 border-blue-600 text-white font-bold"
                                    : "bg-white border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })}
                      <button
                        type="button"
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs transition-colors disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* TAB 3: WALKING CHECKLIST */}
          {activeTab === "walklist" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col space-y-4 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Walking Checklist Directory ({records.length} Voters)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Pre-sorted in walking sequence (Precinct ➔ Street ➔ House ➔
                    Apt). Designed for copying on cheap paper.
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={generateWalkListPDF}
                    disabled={isGeneratingWalkList}
                    className="flex-grow sm:flex-none flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    {isGeneratingWalkList
                      ? "Compiling..."
                      : "Download Checklist PDF"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-grow sm:flex-none flex items-center justify-center gap-1.5 py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Printer className="h-4 w-4" />
                    Print Directly
                  </button>
                </div>
              </div>

              {/* WALKLIST CHECKLIST TABLE PREVIEW */}
              <div className="overflow-x-auto max-h-[440px] border border-slate-150 rounded-xl">
                <table className="w-full text-left text-[11px] text-slate-600 border-collapse">
                  <thead className="bg-slate-50 text-[10px] text-slate-700 uppercase font-bold tracking-wider sticky top-0 border-b border-slate-150">
                    <tr>
                      <th className="px-4 py-3">Num</th>
                      <th className="px-4 py-3">Voter Name</th>
                      <th className="px-4 py-3">Registered Address</th>
                      <th className="px-4 py-3">Age</th>
                      <th className="px-4 py-3">Sex</th>
                      <th className="px-4 py-3">Party</th>
                      <th className="px-4 py-3 text-center">Checked?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2 font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2 font-bold text-slate-900">
                          {r.first_name} {r.last_name} {r.suffix}
                        </td>
                        <td className="px-4 py-2 font-medium text-slate-700">
                          {r.address}{" "}
                          {r.suite_number ? `#${r.suite_number}` : ""}, {r.city}
                        </td>
                        <td className="px-4 py-2">
                          {r["RNCfiles.Age"] || "N/A"}
                        </td>
                        <td className="px-4 py-2 font-medium">
                          {r.sex || "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                              getPartyInitial(r["RNCfiles.OfficialParty"]) ===
                              "D"
                                ? "bg-blue-50 border-blue-100 text-blue-700"
                                : getPartyInitial(
                                      r["RNCfiles.OfficialParty"],
                                    ) === "R"
                                  ? "bg-red-50 border-red-100 text-red-700"
                                  : "bg-slate-50 border-slate-100 text-slate-600"
                            }`}
                          >
                            {getPartyInitial(r["RNCfiles.OfficialParty"])}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 h-4 w-4"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                  className="text-blue-600 hover:underline font-semibold text-left focus:outline-none inline"
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
              className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-semibold hover:bg-slate-50 transition-colors text-center shadow-xs"
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
