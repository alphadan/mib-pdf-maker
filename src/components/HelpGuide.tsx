import { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  Terminal,
  BookOpen,
  AlertCircle,
} from "lucide-react";

export default function HelpGuide() {
  const [copied, setCopied] = useState(false);

  const rawMarkdown = `# PA Ballot Application PreFiller Manual

An operational guide for batch compiling, double-sided printer alignment, and canvassing packet assembly.

## 📋 Table of Contents
1. Step-by-Step Canvassing Assembly Workflow
2. Pre-Flight Quality Control Checklist
3. Printer Calibration & Scaling Settings
4. Data Schema & Required Columns Checklist
5. Duplex (Double-Sided) Printing Layout
6. Appendix: PA Counties & Numeric Codes Index

---

## 1. 🚶 Step-by-Step Assembly Workflow

1. **County Self-Mailer Setup**:
   Go to the **County Self-Mailer Page** tab, choose the correct county, and export the address sheet.
2. **Batch voter compilation**:
   Upload your CSV to the selected Purpose workspace tab (e.g., Mail-In Ballots, New Voter Registration, etc.) and download the compiled PDF containing all your voters.
3. **Print Duplex Packets**:
   Load the self-mailer page as the front page and the compiled voter-details document as the back side. Print them.
4. **Voter Canvassing & Execution**:
   Hand the packet to the voter. The voter must **sign and date Section 8 in ink**.
5. **Prepare for Mailing**:
   Fold the form with the county self-mailer address facing outward. Seal the edge or place it in an envelope so the mailing address is fully visible.

---

## 2. ✅ Pre-Flight Quality Control Checklist

- [ ] Scale settings explicitly configured to **100% / Actual Size**.
- [ ] Application printed double-sided on sturdy letter paper.
- [ ] Registered county address matches the voter's county of registration.
- [ ] Signature Section 8 completed in ink by the voter.

---

## 3. ⚠️ Printer Calibration & Alignment (Critical)

To prevent pre-filled voter data from shifting off-target on official templates, configure your local print settings precisely.

> **CRUCIAL RULE**: Disable all "Fit to Page" or "Scale to Fit" options.

### Required Print Dialog Parameters:
| Setting | Correct Value | Purpose |
| :--- | :--- | :--- |
| **Scale** | \`Actual Size (100%)\` | Retains vector coordinates without scaling distortion |
| **Paper Size** | \`Letter (8.5" x 11")\` | Standard US Mail-In Form dimensions |
| **Margins** | \`None\` or \`Default\` | Prevents page shifts or crop lines |
| **Duplexing** | \`Two-Sided (Flip on Long Edge)\` | Synchronizes Mailer address with Ballot Form |

---

## 4. 🗃️ CSV Schema Verification

The PA Ballot Application Suite uses a **Dynamic, Context-Aware Schema Validation Engine**. Rather than forcing a rigid 19-column list for all tasks, the application checks for required fields depending on the active menu tab.

> 💡 **Excel Support (.xlsx / .xls)**: You can now upload Excel files directly! The system silently converts them in browser memory. Just ensure your active voter dataset is on the **first (leftmost) tab** of your workbook. If you upload an unsupported file (like a .pdf or .png), the system will clearly notify you of the detected extension and guide you to upload a .csv or .xlsx instead.

### Schema Field Classifications

| Column Header Name | Field Type / Color | Required Tab Context | Purpose & Core Mapping |
| :--- | :---: | :---: | :--- |
| **First_Name** | 🟢 Universal (Green) | **ALL Tabs** | Voter's first name |
| **Middle_Name** | 🟢 Universal (Green) | **ALL Tabs** | Voter's middle name or initial |
| **Last_Name** | 🟢 Universal (Green) | **ALL Tabs** | Voter's last name |
| **Suffix** | 🟢 Universal (Green) | **ALL Tabs** | Suffix (JR, SR, II, III, IV draws circle bubble) |
| **House__** | 🟢 Universal (Green) | **ALL Tabs** | House number of residence |
| **StreetNameComplete** | 🟢 Universal (Green) | **ALL Tabs** | Street name of residence |
| **Apt__** | 🟢 Universal (Green) | **ALL Tabs** | Apartment, suite, or room number (can be empty/Null) |
| **City** | 🟢 Universal (Green) | **ALL Tabs** | Registered city or town |
| **Zip_Code** | 🟢 Universal (Green) | **ALL Tabs** | Registered ZIP code |
| **RNCfiles.HouseholdParty** | 🟢 Universal (Green) | **ALL Tabs** | Household party identifier (labeled as HHParty on walk list) |
| **Precinct** | 🟢 Universal (Green) | **ALL Tabs** | Precinct district code (used for walking list) |
| **RNCfiles.Age** | 🟢 Universal (Green) | **ALL Tabs** | Section 2 Voting Age 18+ checkboxes & numeric age for walk list |
| **Sex** | 🟢 Universal (Green) | **ALL Tabs** | Required to print the Walk List (legally optional on physical paper form) |
| **County** | 🟢 Universal (Green) | **ALL Tabs** | Registered county (auto-resolves numeric codes) |

| **Email** | 🔵 Optional (Blue) | *Optional* | Contact email address |
| **Municipality** | 🔵 Optional (Blue) | *Optional* | Municipality name (if blank, resolved from precinct) |
| **Ward** | 🔵 Optional (Blue) | *Optional* | Ward number |
| **Lived_Since** | 🔵 Optional (Blue) | *Optional* | How long they lived at current address (Section 6) |
| **MAddress_Line_1** | 🔵 Optional (Blue) | *Optional* | Alternate mailing street address line 1 |
| **MAddress_Line_2** | 🔵 Optional (Blue) | *Optional* | Alternate mailing street address line 2 |
| **MCity** | 🔵 Optional (Blue) | *Optional* | Alternate mailing city |
| **MState** | 🔵 Optional (Blue) | *Optional* | Alternate mailing state code |
| **MZip_Code** | 🔵 Optional (Blue) | *Optional* | Alternate mailing ZIP code |
| **Date_Of_Birth** | 🟢 Universal (Green) | **ALL Tabs** | Voter date of birth (MM/DD/YYYY) |
| **Reason** | 🟡 Reason-Specific (Yellow) | Registration Forms | Sec. 3 Application Reason (determined dynamically from active tab) |
| **Citizen** | 🟡 Reason-Specific (Yellow) | Registration Forms | Section 2 US Citizenship yes/no checkboxes (cardinality is true) |
| **RNCfiles.OfficialParty** | 🟡 Reason-Specific (Yellow) | Registration Forms | Sec. 8 Political Party (Hardcoded to select 'Republican' on form) |
| **Prev_Name** | 🟡 Reason-Specific (Yellow) | **Change of Name** | Section 9 previous registered name |
| **Prev_Address** | 🟡 Reason-Specific (Yellow) | **Address/Movers** | Section 9 previous street address |
| **Mib_Address** | 🟡 Reason-Specific (Yellow) | **Mail-In Only** | Delivery street address for mail-in ballots |
| **Mib_City** | 🟡 Reason-Specific (Yellow) | **Mail-In Only** | Delivery city for mail-in ballots |
| **Mib_State** | 🟡 Reason-Specific (Yellow) | **Mail-In Only** | Delivery state for mail-in ballots |
| **Mib_Zip** | 🟡 Reason-Specific (Yellow) | **Mail-In Only** | Delivery ZIP for mail-in ballots |

*Note: Fallback mappings automatically bind to both legacy headers (e.g. \`House__\`, \`StreetNameComplete\`, \`Date_Of_Birth\`) and your new clean Google Sheets format transparently.*

---

## 5. 🔄 Duplex (Double-Sided) Printing Layout

Official ballot applications are designed to be printed **double-sided** so that the county address acts as a self-mailer.

\`\`\`
┌───────────────────────────────────────┐
│              FRONT SIDE               │
│         County Self-Mailer Page       │
│                                       │
│   [Voter Address Area]                │
└───────────────────────────────────────┘
                   │
         Fold and flip long edge
                   │
                   ▼
┌───────────────────────────────────────┐
│               BACK SIDE               │
│      PA Mail-In Ballot Application     │
│                                       │
│   [Voter Details & Signature Sec. 8]  │
└───────────────────────────────────────┘
\`\`\`

---

## 6. 📚 Appendix: PA Counties & Numeric Codes Index

When uploading spreadsheets, you can supply PA counties using their official numeric indices (1 to 67) or their full text names (e.g. \`15\` or \`Chester\`). The parsing engine will automatically resolve them to their full official names and print them onto the form:

- **01 / 15:** Chester
- **02:** Allegheny
- **03:** Armstrong
- **04:** Beaver
- **05:** Bedford
- **06:** Berks
- **07:** Blair
- **08:** Bradford
- **09:** Bucks
- **10:** Butler
- **11:** Cambria
- **12:** Cameron
- **13:** Carbon
- **14:** Centre
- **16:** Clarion
- **17:** Clearfield
- **18:** Clinton
- **19:** Columbia
- **20:** Crawford
- **21:** Cumberland
- **22:** Dauphin
- **23:** Delaware
- **24:** Elk
- **25:** Erie
- **26:** Fayette
- **27:** Forest
- **28:** Franklin
- **29:** Fulton
- **30:** Greene
- **31:** Huntingdon
- **32:** Indiana
- **33:** Jefferson
- **34:** Juniata
- **35:** Lackawanna
- **36:** Lancaster
- **37:** Lawrence
- **38:** Lebanon
- **39:** Lehigh
- **40:** Luzerne
- **41:** Lycoming
- **42:** McKean
- **43:** Mercer
- **44:** Mifflin
- **45:** Monroe
- **46:** Montgomery
- **47:** Montour
- **48:** Northampton
- **49:** Northumberland
- **50:** Perry
- **51:** Philadelphia
- **52:** Pike
- **53:** Potter
- **54:** Schuylkill
- **55:** Snyder
- **56:** Somerset
- **57:** Sullivan
- **58:** Susquehanna
- **59:** Tioga
- **60:** Union
- **61:** Venango
- **62:** Warren
- **63:** Washington
- **64:** Wayne
- **65:** Westmoreland
- **66:** Wyoming
- **67:** York`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              System Documentation Center
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive workspace user guide & printing manual in raw
              Markdown.
            </p>
          </div>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center justify-center gap-1.5 py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all shadow-sm focus:outline-none"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-600">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-slate-400" />
              <span>Copy Raw Markdown (.md)</span>
            </>
          )}
        </button>
      </div>

      {/* DOCUMENT SIMULATOR TAB */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Editor Window Header tab */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-400 block"></span>
              <span className="h-3 w-3 rounded-full bg-amber-400 block"></span>
              <span className="h-3 w-3 rounded-full bg-emerald-400 block"></span>
            </span>
            <span className="text-slate-300 mx-1.5 text-xs">|</span>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-md border border-slate-200/60 shadow-xs text-xs font-mono font-semibold text-slate-700">
              <FileText className="h-3.5 w-3.5 text-emerald-600" />
              PRINTER_MANUAL.md
            </div>
          </div>
          <div className="text-[10px] font-mono font-medium text-slate-400">
            MARKDOWN PREVIEW MODE
          </div>
        </div>

        {/* MARKDOWN RENDER VIEW */}
        <div className="p-8 md:p-12 space-y-8 text-slate-800 leading-relaxed text-sm select-text">
          {/* TITLE */}
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              PA Ballot Application PreFiller Manual
            </h1>
            <p className="text-slate-500 text-xs mt-1.5 italic font-medium">
              An operational guide for batch compiling, double-sided printer
              alignment, and canvassing packet assembly.
            </p>
          </div>

          {/* TABLE OF CONTENTS */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-2.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Terminal className="h-4 w-4 text-slate-500" />
              Table of Contents
            </h4>
            <ol className="space-y-1.5 text-xs text-slate-600 font-medium pl-1 list-none">
              <li>
                1.{" "}
                <a href="#scaling" className="text-blue-600 hover:underline">
                  Printer Calibration & Scaling Settings
                </a>
              </li>
              <li>
                2.{" "}
                <a href="#workflow" className="text-blue-600 hover:underline">
                  Step-by-Step Canvassing Assembly Workflow
                </a>
              </li>
              <li>
                2.{" "}
                <a href="#checklist" className="text-blue-600 hover:underline">
                  Pre-Flight Quality Control Checklist
                </a>
              </li>
              <li>
                4.{" "}
                <a href="#schema" className="text-blue-600 hover:underline">
                  Data Schema & Required Columns Checklist
                </a>
              </li>
              <li>
                5.{" "}
                <a href="#duplex" className="text-blue-600 hover:underline">
                  Duplex (Double-Sided) Printing Layout
                </a>
              </li>
              <li>
                6.{" "}
                <a href="#appendix" className="text-blue-600 hover:underline">
                  Appendix: PA Counties & Numeric Codes Index
                </a>
              </li>
            </ol>
          </div>

          <hr className="border-slate-150" />

          {/* SECTION 1: WORKFLOW */}
          <div id="workflow" className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-slate-300 font-mono font-normal">#</span>
              1. 🚶 Step-by-Step Canvassing Assembly Workflow
            </h2>
            <ol className="space-y-4 list-decimal pl-5">
              <li>
                <strong>County Self-Mailer Setup:</strong>
                <p className="text-slate-600 mt-1">
                  Go to the <em>County Self-Mailer Page</em> tab, choose the
                  correct county where your voters reside, and export the
                  address sheet. Keep this layout file loaded.
                </p>
              </li>
              <li>
                <strong>Batch Voter Compilation:</strong>
                <p className="text-slate-600 mt-1">
                  Upload your voter CSV spreadsheet to the{" "}
                  <em>
                    selected Purpose workspace tab (e.g., Mail-In Ballots, New
                    Voter Registration, etc.)
                  </em>
                  . The system will auto-verify the mandatory headers in your
                  web browser.
                </p>
              </li>
              <li>
                <strong>Print Duplex Packets:</strong>
                <p className="text-slate-600 mt-1">
                  Combine files inside your print driver to print the
                  self-mailer address sheet as the <strong>front side</strong>,
                  and each voter application details on the{" "}
                  <strong>reverse (back side)</strong>.
                </p>
              </li>
              <li>
                <strong>Voter Canvassing & Execution:</strong>
                <p className="text-slate-600 mt-1">
                  Physically canvas and locate the voter. Hand them the
                  completed packet, and ensure they{" "}
                  <strong>sign and date Section 8 in wet ink</strong>.
                </p>
              </li>
              <li>
                <strong>Or Prepare for Mailing:</strong>
                <p className="text-slate-600 mt-1">
                  Fold the completed sheet with the county self-mailer address
                  page facing outward. Seal the edge or place it inside a
                  standard clear-window mailing envelope.
                </p>
              </li>
            </ol>
          </div>

          <hr className="border-slate-150" />

          {/* SECTION 2: CHECKLIST */}
          <div id="checklist" className="space-y-4 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-slate-300 font-mono font-normal">#</span>
              2. ✅ Pre-Flight Quality Control Checklist
            </h2>
            <ul className="space-y-3 list-none pl-1">
              <li className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <strong className="text-slate-900 text-sm">
                    Printer scale configured to 100%
                  </strong>
                  <p className="text-xs text-slate-500">
                    Ensure &quot;Actual Size&quot; is locked to prevent
                    shifting.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <strong className="text-slate-900 text-sm">
                    Applications are printed double-sided
                  </strong>
                  <p className="text-xs text-slate-500">
                    The self-mailer must correspond back-to-back with the
                    official application page.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <strong className="text-slate-900 text-sm">
                    County match verified
                  </strong>
                  <p className="text-xs text-slate-500">
                    Selected self-mailer county corresponds exactly with the
                    voter&apos;s registered voting location.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <strong className="text-slate-900 text-sm">
                    Wet Signature Sec. 8 Completed
                  </strong>
                  <p className="text-xs text-slate-500">
                    Ensure the canvassed voter signs and dates Section 8 in wet
                    ink before dispatching.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <hr className="border-slate-150" />

          {/* SECTION 3: CALIBRATION */}
          <div id="scaling" className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-slate-300 font-mono font-normal">#</span>
              3. ⚠️ Printer Calibration & Alignment (Critical)
            </h2>
            <p>
              To prevent pre-filled voter data from shifting off-target on
              official templates, configure your local print settings precisely.
            </p>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs uppercase tracking-wider text-amber-800 font-bold mb-0.5">
                  CRUCIAL RULE:
                </strong>
                <p className="text-xs leading-relaxed">
                  Disable all <strong>&quot;Fit to Page&quot;</strong> or{" "}
                  <strong>&quot;Scale to Fit&quot;</strong> options. These
                  settings slightly shrink the form margins, which will throw
                  off the pre-filled text overlays.
                </p>
              </div>
            </div>

            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider pt-2">
              Required Print Dialog Parameters:
            </h3>
            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5 border-r border-slate-150">
                      Setting
                    </th>
                    <th className="px-4 py-2.5 border-r border-slate-150">
                      Correct Value
                    </th>
                    <th className="px-4 py-2.5">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 border-r border-slate-150 bg-slate-50/20">
                      Scale
                    </td>
                    <td className="px-4 py-3 border-r border-slate-150 font-semibold text-emerald-700">
                      Actual Size (100%)
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      Retains vector coordinates without scaling distortion.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 border-r border-slate-150 bg-slate-50/20">
                      Paper Size
                    </td>
                    <td className="px-4 py-3 border-r border-slate-150 font-semibold text-emerald-700">
                      Letter (8.5&quot; x 11&quot;) min 28 lb.
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      Standard US Mail-In Form dimensions.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 border-r border-slate-150 bg-slate-50/20">
                      Margins
                    </td>
                    <td className="px-4 py-3 border-r border-slate-150 font-semibold text-emerald-700">
                      None / Default
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      Prevents unwanted top or left padding page shifts.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 border-r border-slate-150 bg-slate-50/20">
                      Duplexing
                    </td>
                    <td className="px-4 py-3 border-r border-slate-150 font-semibold text-emerald-700">
                      Two-Sided (Flip on Long Edge)
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      Synchronizes the Mailer Address Page with the Ballot
                      Application on the reverse side.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr className="border-slate-150" />

            {/* SECTION 4: DUPLEX */}
            <div id="duplex" className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-slate-300 font-mono font-normal">#</span>
                4. 🔄 Duplex (Double-Sided) Printing Layout
              </h2>
              <p>
                Official ballot applications are designed to be printed
                **double-sided** so that the county address printed on the back
                acts as a self-mailer foldout page.
              </p>

              <div className="bg-slate-900 text-slate-400 p-5 rounded-xl font-mono text-xs leading-5 border border-slate-800 shadow-inner overflow-x-auto">
                <pre className="text-slate-300 select-all">
                  {`┌───────────────────────────────────────┐
  │              FRONT SIDE               │
  │         County Self-Mailer Page       │
  │                                       │
  │   [Voter Address Area]                │
  └───────────────────────────────────────┘
                     │
           Fold and flip long edge
                     │
                     ▼
  ┌───────────────────────────────────────┐
  │               BACK SIDE               │
  │      PA Mail-In Ballot Application     │
  │                                       │
  │   [Voter Details & Signature Sec. 8]  │
  └───────────────────────────────────────┘`}
                </pre>
              </div>
          </div>

          <hr className="border-slate-150" />

          {/* SECTION 5: SCHEMA */}
          <div id="schema" className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-slate-300 font-mono font-normal">#</span>
              5. 🗃️ Appendix: CSV Schema Verification & Field Mappings
            </h2>
            <p className="text-slate-600 leading-relaxed">
              The PA Ballot Application Suite utilizes a **Dynamic Context-Aware Validation Engine**.
              Instead of rejecting spreadsheets due to irrelevant missing headers, the engine validates columns contextually based on the active tab workflow. Columns are categorized into three requirement levels:
            </p>

            <div className="bg-blue-50/50 border border-blue-150 p-4 rounded-xl flex items-start gap-3 mt-2 select-text">
              <span className="text-base">💡</span>
              <div className="text-[11px] text-blue-800 leading-relaxed">
                <span className="font-bold">Direct Excel Support (.xlsx / .xls):</span> You can upload Excel files directly! The system silently and securely converts them to CSV inside your browser's memory using SheetJS. Please make sure that your active voter database is located on the <span className="font-bold underline">first (leftmost) tab</span> of the uploaded workbook. If you accidentally upload an unsupported file (such as a <code>.pdf</code> or <code>.png</code>), the uploader will safely detect the format, show you exactly what extension was uploaded, and guide you to provide a <code>.csv</code> or <code>.xlsx</code> instead.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Universal Core
                </span>
                <p className="text-[11px] text-emerald-700 mt-2 font-medium">
                  Mandatory on **all** uploads. Identifies voter and registration residence.
                </p>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  Optional Helper
                </span>
                <p className="text-[11px] text-blue-700 mt-2 font-medium">
                  Can be fully omitted without blocking CSV uploads. Programmed with safe fallbacks.
                </p>
              </div>

              <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Reason-Specific
                </span>
                <p className="text-[11px] text-amber-700 mt-2 font-medium">
                  Strictly validated **only** when selecting associated purpose workflows.
                </p>
              </div>
            </div>

            <div className="border border-slate-150 rounded-xl overflow-hidden mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-700 border-b border-slate-150 tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Column Name</th>
                      <th className="px-4 py-3">Requirement Type</th>
                      <th className="px-4 py-3">Target Tab Requirement</th>
                      <th className="px-4 py-3">Form Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-600 bg-white">
                    {/* UNIVERSAL (GREEN) */}
                    {[
                      { name: "Precinct", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "Precinct number (vital for alphanumeric walking order)" },
                      { name: "First_Name", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "First name of the applicant" },
                      { name: "Middle_Name", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "Middle name or initial (required header, can have empty/null cells)" },
                      { name: "Last_Name", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "Last name of the applicant" },
                      { name: "Suffix", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "Suffix (JR, SR, II, III, IV draws vector bubble) (required header, can have empty/null cells)" },
                      { name: "House__", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "House/Residence number (e.g. 123)" },
                      { name: "StreetNameComplete", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "Street name complette (e.g. Main St)" },
                      { name: "Apt__", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "Apartment/Suite number (required header, can have empty/null cells)" },
                      { name: "City", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "Registered city of residence" },
                      { name: "Zip_Code", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "ZIP code of registration" },
                      { name: "County", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "County of registration (auto-resolves numeric codes). Field not required for Mail-In Ballot Application" },
                      { name: "Date_Of_Birth", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "Voter date of birth (MM/DD/YYYY)" },
                      { name: "RNCfiles.Age", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "Numeric age for walk list and Section 2 18+ auto-evaluation" },
                      { name: "Sex", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "Required to compile/print the Walk List (note: legally optional on the physical paper form)" },
                      { name: "RNCfiles.HouseholdParty", type: "Universal (Green)", style: "bg-emerald-50 text-emerald-800 border-emerald-100", context: "ALL tabs", desc: "Household party identifier (labeled as HHParty on walk list)" },

                      { name: "Email", type: "Optional (Blue)", style: "bg-blue-50 text-blue-800 border-blue-100", context: "Optional", desc: "Voter contact email address" },
                      { name: "Municipality", type: "Optional (Blue)", style: "bg-blue-50 text-blue-800 border-blue-100", context: "Optional", desc: "Municipality name (resolves programmatically from Precinct if blank)" },
                      { name: "Ward", type: "Optional (Blue)", style: "bg-blue-50 text-blue-800 border-blue-100", context: "Optional", desc: "Registered ward" },
                      { name: "Lived_Since", type: "Optional (Blue)", style: "bg-blue-50 text-blue-800 border-blue-100", context: "Optional", desc: "Residency duration mapped to Section 6 on Page 1" },
                      { name: "MAddress_Line_1", type: "Optional (Blue)", style: "bg-blue-50 text-blue-800 border-blue-100", context: "Optional", desc: "Alternate mailing street address line 1" },
                      { name: "MAddress_Line_2", type: "Optional (Blue)", style: "bg-blue-50 text-blue-800 border-blue-100", context: "Optional", desc: "Alternate mailing street address line 2" },
                      { name: "MCity", type: "Optional (Blue)", style: "bg-blue-50 text-blue-800 border-blue-100", context: "Optional", desc: "Alternate mailing city" },
                      { name: "MState", type: "Optional (Blue)", style: "bg-blue-50 text-blue-800 border-blue-100", context: "Optional", desc: "Alternate mailing state" },
                      { name: "MZip_Code", type: "Optional (Blue)", style: "bg-blue-50 text-blue-800 border-blue-100", context: "Optional", desc: "Alternate mailing ZIP code" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-bold font-mono text-slate-800">{row.name}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.style}`}>{row.type}</span>
                        </td>
                        <td className="px-4 py-2.5 italic text-slate-400">{row.context}</td>
                        <td className="px-4 py-2.5 text-slate-500">{row.desc}</td>
                      </tr>
                    ))}

                    {/* REASON-SPECIFIC (YELLOW) */}
                    {[
                      { name: "Reason", type: "Reason-Specific (Yellow)", style: "bg-amber-50 text-amber-800 border-amber-100", context: "Registration Forms", desc: "Sec. 3 Application Reason (determined dynamically from active tab)" },
                      { name: "Citizen", type: "Reason-Specific (Yellow)", style: "bg-amber-50 text-amber-800 border-amber-100", context: "Registration Forms", desc: "Section 2 US Citizenship yes/no checkboxes (cardinality is true)" },
                      { name: "RNCfiles.OfficialParty", type: "Reason-Specific (Yellow)", style: "bg-amber-50 text-amber-800 border-amber-100", context: "Registration Forms", desc: "Sec. 8 Political Party selection (Hardcoded to check the 'Republican' bubble on the printed form)" },
                      { name: "Prev_Name", type: "Reason-Specific (Yellow)", style: "bg-amber-50 text-amber-800 border-amber-100", context: "Change Name Only", desc: "Fills out Section 9 Previous Registered Name" },
                      { name: "Prev_Address", type: "Reason-Specific (Yellow)", style: "bg-amber-50 text-amber-800 border-amber-100", context: "Address & New Movers", desc: "Fills out Section 9 Previous Residential Address" },
                      { name: "Mib_Address", type: "Reason-Specific (Yellow)", style: "bg-amber-50 text-amber-800 border-amber-100", context: "Mail-In Ballot Only", desc: "Target delivery street for mail-in ballot papers" },
                      { name: "Mib_City", type: "Reason-Specific (Yellow)", style: "bg-amber-50 text-amber-800 border-amber-100", context: "Mail-In Ballot Only", desc: "Target delivery city for mail-in ballot papers" },
                      { name: "Mib_State", type: "Reason-Specific (Yellow)", style: "bg-amber-50 text-amber-800 border-amber-100", context: "Mail-In Ballot Only", desc: "Target delivery state for mail-in ballot papers" },
                      { name: "Mib_Zip", type: "Reason-Specific (Yellow)", style: "bg-amber-50 text-amber-800 border-amber-100", context: "Mail-In Ballot Only", desc: "Target delivery ZIP for mail-in ballot papers" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-bold font-mono text-slate-800">{row.name}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.style}`}>{row.type}</span>
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-slate-700">{row.context}</td>
                        <td className="px-4 py-2.5 text-slate-500">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              *Note: Behind the scenes, the parsing engine maintains backwards compatibility, automatically resolving legacy headers (like <code>House__</code>, <code>StreetNameComplete</code>, <code>Date_Of_Birth</code>, and <code>RNCfiles.PrimaryPhone</code>) transparently.
            </p>
          </div>


          <hr className="border-slate-150" />

          {/* SECTION 6 */}
          <div id="appendix" className="space-y-4 pb-8">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-slate-300 font-mono font-normal">#</span>
              6. 📚 Appendix: PA Counties & Numeric Codes Index
            </h2>
            <p className="text-slate-600 leading-relaxed">
              When uploading spreadsheets, you can supply PA counties using their official numeric indices (1 to 67) or their full text names (e.g. <code>15</code> or <code>Chester</code>). The parsing engine will automatically resolve them to their full official names and overlay them onto the PDF:
            </p>

            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 select-text">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-2 text-xs font-mono text-slate-700">
                <div><span className="font-bold text-slate-400">01 / 15:</span> Chester</div>
                <div><span className="font-bold text-slate-400">02:</span> Allegheny</div>
                <div><span className="font-bold text-slate-400">03:</span> Armstrong</div>
                <div><span className="font-bold text-slate-400">04:</span> Beaver</div>
                <div><span className="font-bold text-slate-400">05:</span> Bedford</div>
                <div><span className="font-bold text-slate-400">06:</span> Berks</div>
                <div><span className="font-bold text-slate-400">07:</span> Blair</div>
                <div><span className="font-bold text-slate-400">08:</span> Bradford</div>
                <div><span className="font-bold text-slate-400">09:</span> Bucks</div>
                <div><span className="font-bold text-slate-400">10:</span> Butler</div>
                <div><span className="font-bold text-slate-400">11:</span> Cambria</div>
                <div><span className="font-bold text-slate-400">12:</span> Cameron</div>
                <div><span className="font-bold text-slate-400">13:</span> Carbon</div>
                <div><span className="font-bold text-slate-400">14:</span> Centre</div>
                <div><span className="font-bold text-slate-400">16:</span> Clarion</div>
                <div><span className="font-bold text-slate-400">17:</span> Clearfield</div>
                <div><span className="font-bold text-slate-400">18:</span> Clinton</div>
                <div><span className="font-bold text-slate-400">19:</span> Columbia</div>
                <div><span className="font-bold text-slate-400">20:</span> Crawford</div>
                <div><span className="font-bold text-slate-400">21:</span> Cumberland</div>
                <div><span className="font-bold text-slate-400">22:</span> Dauphin</div>
                <div><span className="font-bold text-slate-400">23:</span> Delaware</div>
                <div><span className="font-bold text-slate-400">24:</span> Elk</div>
                <div><span className="font-bold text-slate-400">25:</span> Erie</div>
                <div><span className="font-bold text-slate-400">26:</span> Fayette</div>
                <div><span className="font-bold text-slate-400">27:</span> Forest</div>
                <div><span className="font-bold text-slate-400">28:</span> Franklin</div>
                <div><span className="font-bold text-slate-400">29:</span> Fulton</div>
                <div><span className="font-bold text-slate-400">30:</span> Greene</div>
                <div><span className="font-bold text-slate-400">31:</span> Huntingdon</div>
                <div><span className="font-bold text-slate-400">32:</span> Indiana</div>
                <div><span className="font-bold text-slate-400">33:</span> Jefferson</div>
                <div><span className="font-bold text-slate-400">34:</span> Juniata</div>
                <div><span className="font-bold text-slate-400">35:</span> Lackawanna</div>
                <div><span className="font-bold text-slate-400">36:</span> Lancaster</div>
                <div><span className="font-bold text-slate-400">37:</span> Lawrence</div>
                <div><span className="font-bold text-slate-400">38:</span> Lebanon</div>
                <div><span className="font-bold text-slate-400">39:</span> Lehigh</div>
                <div><span className="font-bold text-slate-400">40:</span> Luzerne</div>
                <div><span className="font-bold text-slate-400">41:</span> Lycoming</div>
                <div><span className="font-bold text-slate-400">42:</span> McKean</div>
                <div><span className="font-bold text-slate-400">43:</span> Mercer</div>
                <div><span className="font-bold text-slate-400">44:</span> Mifflin</div>
                <div><span className="font-bold text-slate-400">45:</span> Monroe</div>
                <div><span className="font-bold text-slate-400">46:</span> Montgomery</div>
                <div><span className="font-bold text-slate-400">47:</span> Montour</div>
                <div><span className="font-bold text-slate-400">48:</span> Northampton</div>
                <div><span className="font-bold text-slate-400">49:</span> Northumberland</div>
                <div><span className="font-bold text-slate-400">50:</span> Perry</div>
                <div><span className="font-bold text-slate-400">51:</span> Philadelphia</div>
                <div><span className="font-bold text-slate-400">52:</span> Pike</div>
                <div><span className="font-bold text-slate-400">53:</span> Potter</div>
                <div><span className="font-bold text-slate-400">54:</span> Schuylkill</div>
                <div><span className="font-bold text-slate-400">55:</span> Snyder</div>
                <div><span className="font-bold text-slate-400">56:</span> Somerset</div>
                <div><span className="font-bold text-slate-400">57:</span> Sullivan</div>
                <div><span className="font-bold text-slate-400">58:</span> Susquehanna</div>
                <div><span className="font-bold text-slate-400">59:</span> Tioga</div>
                <div><span className="font-bold text-slate-400">60:</span> Union</div>
                <div><span className="font-bold text-slate-400">61:</span> Venango</div>
                <div><span className="font-bold text-slate-400">62:</span> Warren</div>
                <div><span className="font-bold text-slate-400">63:</span> Washington</div>
                <div><span className="font-bold text-slate-400">64:</span> Wayne</div>
                <div><span className="font-bold text-slate-400">65:</span> Westmoreland</div>
                <div><span className="font-bold text-slate-400">66:</span> Wyoming</div>
                <div><span className="font-bold text-slate-400">67:</span> York</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
