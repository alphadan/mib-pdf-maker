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
1. Printer Calibration & Scaling Settings
2. Data Schema & Required Columns Checklist
3. Duplex (Double-Sided) Printing Layout
4. Step-by-Step Canvassing Assembly Workflow
5. Pre-Flight Quality Control Checklist

---

## 1. ⚠️ Printer Calibration & Alignment (Critical)

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

## 2. 🗃️ CSV Schema Verification

Ensure your voter records file contains the 20 required headers before batch generation.

### Mandatory Column Headers (Case-Sensitive):
\`\`\`csv
First_Name, Middle_Name, Last_Name, Suffix, Date_Of_Birth, House__, StreetNameComplete, Apt__, City, State, Zip_Code, MAddress_Line_1, MAddress_Line_2, MCity, MState, MZip_Code, PollingPlaceDescript, Ward, RNCfiles.PrimaryPhone, Voter_Status
\`\`\`

*Note: \`Precinct\`, \`Sex\`, and \`VBM.AppType\` are optional. If they are absent, the application defaults to safe values.*

---

## 3. 🔄 Duplex (Double-Sided) Printing Layout

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

## 4. 🚶 Step-by-Step Assembly Workflow

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

## 5. ✅ Pre-Flight Quality Control Checklist

- [ ] Scale settings explicitly configured to **100% / Actual Size**.
- [ ] Application printed double-sided on sturdy letter paper.
- [ ] Registered county address matches the voter's county of registration.
- [ ] Signature Section 8 completed in ink by the voter.`;

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
                <a href="#schema" className="text-blue-600 hover:underline">
                  Data Schema & Required Columns Checklist
                </a>
              </li>
              <li>
                3.{" "}
                <a href="#duplex" className="text-blue-600 hover:underline">
                  Duplex (Double-Sided) Printing Layout
                </a>
              </li>
              <li>
                4.{" "}
                <a href="#workflow" className="text-blue-600 hover:underline">
                  Step-by-Step Canvassing Assembly Workflow
                </a>
              </li>
              <li>
                5.{" "}
                <a href="#checklist" className="text-blue-600 hover:underline">
                  Pre-Flight Quality Control Checklist
                </a>
              </li>
            </ol>
          </div>

          <hr className="border-slate-150" />

          {/* SECTION 1 */}
          <div id="scaling" className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-slate-300 font-mono font-normal">#</span>
              1. ⚠️ Printer Calibration & Alignment (Critical)
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
                      Letter (8.5&quot; x 11&quot;)
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

          {/* SECTION 2 */}
          <div id="schema" className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-slate-300 font-mono font-normal">#</span>
              2. 🗃️ CSV Schema Verification
            </h2>
            <p>
              Ensure your voter records file contains the required headers
              before initiating a batch run.
            </p>

            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Mandatory Column Headers (Case-Sensitive):
            </h3>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800 shadow-inner overflow-x-auto">
              <code>
                First_Name, Middle_Name, Last_Name, Suffix, Date_Of_Birth,
                House__, StreetNameComplete, Apt__, City, State, Zip_Code,
                MAddress_Line_1, MAddress_Line_2, MCity, MState, MZip_Code,
                PollingPlaceDescript, Ward, RNCfiles.PrimaryPhone, Voter_Status
              </code>
            </div>

            <p className="text-xs text-slate-500 italic">
              *Note: Optional columns (like <code>Precinct</code>,{" "}
              <code>Sex</code>, and <code>VBM.AppType</code>) can be omitted
              completely without failing the upload but would not be available
              for the walk list.
            </p>
          </div>

          <hr className="border-slate-150" />

          {/* SECTION 3 */}
          <div id="duplex" className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-slate-300 font-mono font-normal">#</span>
              3. 🔄 Duplex (Double-Sided) Printing Layout
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

          {/* SECTION 4 */}
          <div id="workflow" className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-slate-300 font-mono font-normal">#</span>
              4. 🚶 Step-by-Step Canvassing Assembly Workflow
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
                <strong>Prepare for Mailing:</strong>
                <p className="text-slate-600 mt-1">
                  Fold the completed sheet with the county self-mailer address
                  page facing outward. Seal the edge or place it inside a
                  standard clear-window mailing envelope.
                </p>
              </li>
            </ol>
          </div>

          <hr className="border-slate-150" />

          {/* SECTION 5 */}
          <div id="checklist" className="space-y-4 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-slate-300 font-mono font-normal">#</span>
              5. ✅ Pre-Flight Quality Control Checklist
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
        </div>
      </div>
    </div>
  );
}
