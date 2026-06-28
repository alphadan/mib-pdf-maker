import { useState } from "react";
import {
  Printer,
  Mail,
  ShieldCheck,
  UserCheck,
  User,
  Home,
  FileText,
  Briefcase,
  MapPin,
  BookOpen,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pdfTemplateLoaded: boolean | null;
}

export default function Layout({
  children,
  activeTab,
  setActiveTab,
  pdfTemplateLoaded,
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: "mail-in-voting",
      label: "Mail-In Ballots",
      icon: Mail,
      description: "1-Page Self-Mailer Template",
    },
    {
      id: "new-registration",
      label: "New Voter Registration",
      icon: UserCheck,
      description: "2-Page Envelope Template",
    },
    {
      id: "address-change",
      label: "Change of Address",
      icon: Home,
      description: "College Students Dorm Address",
    },
    {
      id: "name-change",
      label: "Change of Name",
      icon: User,
      description: "Name/Marital Status update",
    },
    {
      id: "party-change",
      label: "Change of Political Party",
      icon: FileText,
      description: "Party choice change",
    },
    {
      id: "federal-military",
      label: "Federal / Military Move",
      icon: Briefcase,
      description: "Employees living out-of-state",
    },
    {
      id: "county-address",
      label: "County Self-Mailer Page",
      icon: MapPin,
      description:
        "Create 1 routing sheet copy; print voter requests on the reverse side",
    },
    {
      id: "help-guide",
      label: "Help Guide",
      icon: BookOpen,
      description: "Calibration & user manual",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md">
              <Printer className="h-6.5 w-6.5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                PA Ballot Application PreFiller
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">
                Batch Pre-Filling & County Mailing Manager
              </p>
            </div>
          </div>

          {/* Setup verification indicator */}
          <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-xs">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                pdfTemplateLoaded === true
                  ? "bg-emerald-500 animate-pulse"
                  : pdfTemplateLoaded === false
                    ? "bg-rose-500"
                    : "bg-amber-400"
              }`}
            ></span>
            <span className="font-semibold text-slate-700 text-[11px]">
              {pdfTemplateLoaded === true
                ? "PA Ballot Template Ready"
                : pdfTemplateLoaded === false
                  ? "Template Missing! (public folder)"
                  : "Verifying Template..."}
            </span>
          </div>

          {/* Mobile navigation toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg focus:outline-none"
          >
            <span className="sr-only font-bold text-xs">Menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  mobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1.5 shadow-lg absolute w-full left-0 z-30">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <div>
                  <p>{item.label}</p>
                  <p className="text-[10px] font-normal text-slate-400 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* DASHBOARD GRID */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-4">
          <nav className="space-y-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs sticky top-24">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">
              Application Tools
            </span>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left text-xs font-semibold transition-all ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 ${activeTab === item.id ? "text-white" : "text-slate-400"}`}
                />
                <div>
                  <p className="font-bold">{item.label}</p>
                  <p
                    className={`text-[10px] font-normal mt-0.5 ${activeTab === item.id ? "text-blue-100" : "text-slate-400"}`}
                  >
                    {item.description}
                  </p>
                </div>
              </button>
            ))}

            {/* Privacy badge inside sticky nav container */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-[11px] text-emerald-800 space-y-1 mt-4">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                <span>PII Security Confirmed</span>
              </div>
              <p className="text-emerald-700 leading-relaxed text-[10px]">
                No voter data or CSV spreadsheets ever leave your computer.
                Processing occurs 100% in local memory.
              </p>
            </div>
          </nav>
        </aside>

        {/* MAIN CONTENT WORKSPACE */}
        <main className="flex-grow min-w-0 bg-transparent">{children}</main>
      </div>
    </div>
  );
}
