import { X } from "lucide-react";

interface VoterApplicationsListProps {
  records: any[];
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  generatePDF: (index: number | null) => void;
  isProcessing: boolean;
  clearFile: () => void;
}

// Utility to get household party styling
const getHouseholdPartyBadgeClass = (hhParty: string) => {
  const clean = String(hhParty).trim().toLowerCase();
  if (clean === "democrat only") {
    return "bg-blue-50 border-blue-100 text-blue-700";
  }
  if (clean === "republican/democrat" || clean === "rep/dem/oth") {
    return "bg-purple-50 border-purple-100 text-purple-700";
  }
  if (clean === "republican/other") {
    return "bg-rose-50 border-rose-100 text-rose-700";
  }
  if (clean === "democrat/other") {
    return "bg-indigo-50 border-indigo-100 text-indigo-700";
  }
  if (clean === "other only") {
    return "bg-slate-50 border-slate-100 text-slate-600";
  }
  return "bg-slate-50 border-slate-100 text-slate-600";
};

export default function VoterApplicationsList({
  records,
  currentPage,
  setCurrentPage,
  rowsPerPage,
  setRowsPerPage,
  generatePDF,
  isProcessing,
  clearFile,
}: VoterApplicationsListProps) {
  const totalRecords = records.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
  const paginatedRecords = records.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col select-text">
      {/* HEADER */}
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

      {/* TABLE */}
      <div className="overflow-x-auto max-h-[440px]">
        <table className="w-full text-left text-[11px] text-slate-600">
          <thead className="bg-slate-100 text-[10px] text-slate-700 uppercase font-bold tracking-wider sticky top-0">
            <tr>
              <th className="px-4 py-3 border-b border-slate-200">#</th>
              <th className="px-4 py-3 border-b border-slate-200">
                Voter Name
              </th>
              <th className="px-4 py-3 border-b border-slate-200">Age</th>
              <th className="px-4 py-3 border-b border-slate-200">Party</th>
              <th className="px-4 py-3 border-b border-slate-200">HH Party</th>
              <th className="px-4 py-3 border-b border-slate-200">Address</th>
              <th className="px-4 py-3 border-b border-slate-200">Actions</th>
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
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getHouseholdPartyBadgeClass(
                        r.household_party,
                      )}`}
                    >
                      {r.household_party || "N/A"}
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
            to <strong className="text-slate-800 font-bold">{endIndex}</strong>{" "}
            of{" "}
            <strong className="text-slate-800 font-bold">{totalRecords}</strong>{" "}
            entries
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((prev) => Math.max(1, (prev as number) - 1))
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
              const showEllipses = index > 0 && page - array[index - 1] > 1;
              return (
                <div key={page} className="flex items-center gap-1">
                  {showEllipses && (
                    <span className="text-slate-400 px-1 font-normal">...</span>
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
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(totalPages, (prev as number) + 1),
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
}
