import { CheckCircle, HelpCircle, FileText, AlertCircle } from "lucide-react";

export default function HelpGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Quick Start Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5 mb-2">
          <HelpCircle className="h-6 w-6 text-blue-600" />
          Instructional Printing Guide
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Follow these guidelines to ensure the generated Pennsylvania Mail-in
          Ballot applications are printed correctly, aligned with official
          standards, and mailed securely.
        </p>
      </div>

      {/* Crucial Printer Scaling Section */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm flex gap-4">
        <div className="p-3 bg-amber-100 rounded-xl text-amber-800 h-fit">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-amber-900 text-base">
            ⚠️ Crucial: Physical Printer Alignment Settings
          </h3>
          <p className="text-amber-800 text-sm leading-relaxed">
            When you click Print or open the generated PDF, your system's
            printer dialog might default to{" "}
            <strong>"Fit to Printable Area"</strong> or{" "}
            <strong>"Scale to Fit"</strong>. This will shrink the PDF slightly
            and throw off all of the custom pre-filled text coordinates!
          </p>
          <div className="bg-white/80 border border-amber-200/50 rounded-lg p-3 text-xs font-mono text-slate-700 space-y-1.5">
            <p className="font-bold text-slate-900">
              Recommended settings in your Print dialog:
            </p>
            <p>
              1. Scale: select{" "}
              <strong className="text-blue-700">"Actual Size"</strong> or{" "}
              <strong className="text-blue-700">100%</strong>
            </p>
            <p>
              2. Paper Size: select{" "}
              <strong className="text-blue-700">"Letter"</strong> (8.5 x 11
              inches)
            </p>
            <p>
              3. Margins: select{" "}
              <strong className="text-blue-700">"None"</strong> or{" "}
              <strong className="text-blue-700">"Default"</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Assembly Workflow Steps */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Mailing Package Assembly Workflow
        </h3>

        <div className="relative border-l-2 border-slate-100 pl-6 ml-3.5 space-y-6">
          {/* Step 1 */}
          <div className="relative">
            <span className="absolute -left-10 top-0.5 bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center font-bold text-xs shadow-sm">
              1
            </span>
            <h4 className="font-bold text-slate-900 text-sm">
              Print Your Voter Applications
            </h4>
            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
              Use the <strong>CSV Batch Application Printer</strong> to generate
              and download the consolidated ballot applications. Each
              applicant's details will appear on a separate page.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <span className="absolute -left-10 top-0.5 bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center font-bold text-xs shadow-sm">
              2
            </span>
            <h4 className="font-bold text-slate-900 text-sm">
              Print ONE County Mailing Address Page
            </h4>
            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
              Go to the <strong>County Address Page</strong> tab, select the
              county where your voters are registered, and print{" "}
              <strong>exactly one copy</strong> of the address sheet. This
              single sheet can be copied or printed once and used to route all
              completed ballot applications.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <span className="absolute -left-10 top-0.5 bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center font-bold text-xs shadow-sm">
              3
            </span>
            <h4 className="font-bold text-slate-900 text-sm">
              Fold and Insert Into Envelopes
            </h4>
            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
              Have voters sign and date section 8 of their application. Fold the
              signed application according to your envelope instructions, or
              place it in a standard mailing envelope with your printed county
              address page visible.
            </p>
          </div>
        </div>
      </div>

      {/* Printing Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          Pre-flight Printing Checklist
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
          <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Voters signed and dated Section 8 in ink.</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Applications are complete with no missing fields.</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Selected county matches voter registration location.</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Scale settings are set to 100% / Actual Size.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
