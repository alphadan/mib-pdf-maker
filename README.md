# 🗳️ PA Ballot Application Suite (`mib-pdf-maker`)

An ultra-secure, 100% client-side React web utility built with **Vite**, **TypeScript**, and styled with **Tailwind CSS**. 

The PA Ballot Application Suite enables county election offices, voter outreach groups, and organizers to securely manage voter registration and ballot applications. It offers bulk database parsing, manual individual form pre-filling, county address routing sheet generation, and illustrated printing help guides.

---

## 🔒 Security Design: Absolute PII Confidentiality

Voter databases contain critical Personally Identifiable Information (PII) like names, phone numbers, birthdates, and residential addresses. This application is engineered with a **Zero-Server storage and processing model**:

1. **Local Parsing**: The uploaded CSV spreadsheet is parsed directly inside the browser using `papaparse`.
2. **Local PDF Overlay**: Modifying and pre-filling the official PDF templates is done directly in the browser using `pdf-lib`.
3. **No Remote Uploads**: **No voter data is ever sent over the network, saved on a database, or stored on a server.** Once you close the browser tab, all session data is permanently erased.
4. **Client-Side DoS Protection**: Safety limiters automatically reject files larger than **5MB** or containing more than **500 records** to protect browser memory performance.
5. **No dangerous HTML evaluations**: Completely voids `dangerouslySetInnerHTML` to protect against HTML and Script injection (XSS).

---

## 🚀 Key Features & Workspace Modules

The application features a modern **Top-Level Left Menu Sidebar** that organizes the primary voter actions (Application Purposes) as independent, fully featured workspaces. Each of the six core purposes contains its own **CSV Batch Ingestion Workspace** and a **📝 Single Manual Form Pre-Filler** tab.

### 👤 1. Active Workspaces (Sidebar Categories)
* **Mail-In Ballots:** Loads the 1-page **`PADOS_MailInApplication.pdf`** template. Automatically compatible with the County Duplex Self-Mailer.
* **New Voter Registration:** Loads the 2-page **`PADOS_Registration_Application.pdf`** template. (Requires a mailing envelope).
* **Change of Address:** Moving within Pennsylvania (e.g. college students). Dynamically requires/highlights **Section 8 (Previous Address)**. Loads the 2-page registration template.
* **Change of Name:** Update name due to marriage or divorce. Dynamically requires/highlights **Section 8 (Previous Name)**. Loads the 2-page registration template.
* **Change of Political Party:** Switch political party designation for Primaries. Loads the 2-page registration template.
* **Federal / Military Move:** Pre-fills registrations for federal/military employees out-of-state. Loads the 2-page registration template.

### 🔄 2. Core Capabilities within Each Workspace
* **CSV Bulk Upload Center:** Drag-and-drop ingestion of voter spreadsheets with dynamic required header checking and schema validation.
* **Consolidated Batch Compilation:** Merges hundreds of voter forms and prints them into a single, multi-page consolidated PDF download. Supports multi-page forms seamlessly!
* **📝 Single Manual Form Pre-Filler:** A lightweight, custom-associated manual form allowing organizers to pre-fill individual voter registrations on the spot.
* **Privacy Toggle Checklist:** A sidebar option to exclude sensitive values like **Date of Birth** and **Phone Number** from being pre-filled on printed PDFs by default to safeguard voter privacy.
* **Advanced Coordinates Tuner:** Move field alignments horizontally or vertically in PDF points directly from the browser window. Tuners are isolated so adjustments on the Mail-In template never disrupt alignment on the Registration template.

### ✉️ 3. County Mailing Address Page
* **County-Level Routing:** Select from **Berks**, **Chester**, **Delaware**, or **Montgomery** county to see their official Board of Elections address.
* **Address Page PDF Overlay:** Generates a pre-filled `PADOS_address_page.pdf` with the selected address positioned exactly to align with standard windowed envelopes.

### ❓ 4. Help Guide
* **Interactive Markdown Manual:** An operational markdown guide detailing printer scale calibration (lock scale to **"Actual Size" / 100%**), double-sided print directions, and canvassing assembly rules.

---

## 💻 Local Quickstart

### Prerequisites
* Node.js v20+ or v22+
* npm v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
To bundle the files and compile the production build:
```bash
npm run build
```
This generates a production-optimized `dist/` directory ready for static hosting.

### 4. Deploy to Firebase Hosting
```bash
npm run build && npx firebase deploy --only hosting
```

---

## 📁 Required CSV Schema

To protect data consistency, the CSV validation engine only checks for the **20 required columns** below. Optional columns (like `Precinct`, `Sex`, and `VBM.AppType`) can be omitted completely without failing the upload:

### Mandatory Column Headers (Case-Sensitive):
```csv
First_Name, Middle_Name, Last_Name, Suffix, Date_Of_Birth, House__, StreetNameComplete, Apt__, City, State, Zip_Code, MAddress_Line_1, MAddress_Line_2, MCity, MState, MZip_Code, PollingPlaceDescript, Ward, RNCfiles.PrimaryPhone, Voter_Status
```

### Automated PDF Formatting Rules:
* **Resident State Prefill Bypass:** Since the Pennsylvania application is a state-specific form, the state code `'PA'` is pre-printed on the template. The system skips drawing the `state` text to avoid messy overlaps but retains it in your CSV/Interfaces.
* **Walk List Party Initials Parser:** Prints clean party abbreviations for the Walk List PDF and HTML checklists:
  * **Republican** $\rightarrow$ `R`
  * **Democrat** $\rightarrow$ `D`
  * **Independent / Unaffiliated** $\rightarrow$ `I`
  * **Green** $\rightarrow$ `G`
  * **Libertarian** $\rightarrow$ `L`
  * **Null / Not Found** $\rightarrow$ `NF`
* **Mailer "Same as above" Checkbox:** If alternative mailing columns are blank, the application automatically draws an **`"X"`** at coordinates `x: 190, y: 468` (for Mail-In) or `x: 262, y: 428` (for Registration).
* **Section 1 "Suffix Checkbox" Bubbles:** Instead of writing the suffix as raw text, the application sanitizes the **`Suffix`** column (JR, SR, III, IV). It draws hollow vector circle outlines centered perfectly inside the corresponding template checkboxes. Any other suffix is allowed in your dataset but is excluded from printing on the checkbox coordinates.
