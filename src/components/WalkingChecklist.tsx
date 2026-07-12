import { Download, Printer } from "lucide-react";

interface WalkingChecklistProps {
  records: any[];
  csvFile: File | null;
  isGeneratingWalkList: boolean;
  generateWalkListPDF: () => void;
  getPartyInitial: (partyVal: any) => string;
}

export default function WalkingChecklist({
  records,
  csvFile,
  isGeneratingWalkList,
  generateWalkListPDF,
  getPartyInitial,
}: WalkingChecklistProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col space-y-4 p-6 select-text">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex flex-wrap items-center gap-2">
            <span>Walking Checklist Directory ({records.length} Voters)</span>
            {csvFile && (
              <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-mono font-medium select-text">
                📂 {csvFile.name}
              </span>
            )}
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Pre-sorted in walking sequence (Precinct ➔ Street ➔ House ➔ Apt).
            Designed for copying on cheap paper.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-56">
          <button
            onClick={generateWalkListPDF}
            disabled={isGeneratingWalkList}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isGeneratingWalkList ? "Compiling..." : "Download Checklist PDF"}
          </button>
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Printer className="h-4 w-4" />
            Print Directly
          </button>
        </div>
      </div>

      {/* WALKLIST CHECKLIST TABLE PREVIEW */}
      <div className="overflow-x-auto max-h-[440px] border border-slate-150 rounded-xl select-none">
        <table className="w-full text-left text-[11px] text-slate-600 border-collapse">
          <thead className="bg-slate-50 text-[10px] text-slate-700 uppercase font-bold tracking-wider sticky top-0 border-b border-slate-150">
            <tr>
              <th className="px-4 py-3">Num</th>
              <th className="px-4 py-3">Precinct</th>
              <th className="px-4 py-3">Voter Name</th>
              <th className="px-4 py-3">Registered Address (House, Street, Apt, City, State, Zip Code)</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Sex</th>
              <th className="px-4 py-3">Party</th>
              <th className="px-4 py-3">HH Party</th>
              <th className="px-4 py-3 text-center">Checked?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 select-text">
            {records.map((r, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="px-4 py-2 font-mono text-slate-400">
                  {idx + 1}
                </td>
                <td className="px-4 py-2 font-mono text-slate-700">
                  {r.Precinct || r.precinct || "N/A"}
                </td>
                <td className="px-4 py-2 font-bold text-slate-900">
                  {r.first_name} {r.last_name} {r.suffix}
                </td>
                <td className="px-4 py-2 font-medium text-slate-700">
                  {r.address} {r.suite_number ? `#${r.suite_number}` : ""},{" "}
                  {r.city}, PA {r.zip_code}
                </td>
                <td className="px-4 py-2">{r.Age || r["RNCfiles.Age"] || r.age || "N/A"}</td>
                <td className="px-4 py-2 font-medium">{r.sex || "N/A"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      getPartyInitial(r.party_choice || r["RNCfiles.OfficialParty"]) === "D"
                        ? "bg-blue-50 border-blue-100 text-blue-700"
                        : getPartyInitial(r.party_choice || r["RNCfiles.OfficialParty"]) === "R"
                          ? "bg-red-50 border-red-100 text-red-700"
                          : "bg-slate-50 border-slate-100 text-slate-600"
                    }`}
                  >
                    {getPartyInitial(r.party_choice || r["RNCfiles.OfficialParty"])}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold border bg-slate-50 border-slate-100 text-slate-600">
                    {r.household_party || "N/A"}
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
  );
}
