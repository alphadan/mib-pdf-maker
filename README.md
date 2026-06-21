# 🗳️ PA Ballot Application Suite (`mib-pdf-maker`)

An ultra-secure, 100% client-side React web utility built with **Vite**, **TypeScript**, and styled with **Tailwind CSS**. 

The PA Ballot Application Suite enables county election offices, voter outreach groups, and organizers to securely manage voter registration and ballot applications. It offers bulk database parsing, manual individual form pre-filling, county address routing sheet generation, and illustrated printing help guides.

---

## 🔒 Security Design: Absolute PII Confidentiality

Voter databases contain critical Personally Identifiable Information (PII) like names, phone numbers, birthdates, and residential addresses. This application is engineered with a **Zero-Server storage and processing model**:

1. **Local Parsing**: The uploaded CSV spreadsheet is parsed directly inside the browser using `papaparse`.
2. **Local PDF Overlay**: Modifying and pre-filling the official PDF templates is done directly in the browser using `pdf-lib`.
3. **No Remote Uploads**: **No voter data is ever sent over the network, saved on a database, or stored on a server.** Once you close the browser tab, all session data is permanently erased.
4. **Offline Font Assets**: Embeds standard PDF specification fonts or loads custom CDN typography into secure browser cache.

---

## 🚀 Key Features & Workspace Modules

The application is structured as a **Dashboard Shell** with a collapsible sidebar for seamless tool switching:

### 1. 📁 CSV Batch Application Printer
* **Drag-and-Drop Ingestion:** Ingest voter lists (up to 25 records per batch) with instant CSV schema checks.
* **Consolidated Merging:** Merges multiple filled ballot request pages into a single, multi-page, print-ready PDF batch.
* **Test Sheet:** Offers a "Test Sheet" button next to each voter record to print a single alignment preview before doing a major print run.
* **Fine-Tuner:** Nudge field coordinates horizontally or vertically (in PDF points) directly from the browser window.

### ✉️ 2. County Mailing Address Page
* **County-Level Routing:** Select from **Berks**, **Chester**, **Delaware**, or **Montgomery** county to see their official Board of Elections address.
* **Address Page PDF Overlay:** Generates a pre-filled `PADOS_address_page.pdf` with the selected address positioned exactly to align with standard windowed envelopes.
* **Envelope Window Tuner:** Move the recipient address lines horizontally or vertically to match your physical envelope window sizes.
* **UX Reminder:** Reminds operators they only need to print **one** copy of this sheet per batch.

### 👤 3. New Resident Individual Pre-Filler
* **Interactive Manual Form:** Type in individual registrations on the spot—perfect for real-time voter registration drives.
* **Registration Template Integration:** Automatically writes coordinates and overlays fields on the official **`PADOS_Registration_Application.pdf`** template.

### ❓ 4. Printing Help Guide
* **Printer Scaling Guidelines:** Explicit instructions on printer scaling (e.g. setting Scale to **"Actual Size" / 100%** to avoid alignment shifts).
* **Pre-flight Checklist:** Verify registrations, county destinations, and signature zones before shipping.

---

## 🎨 Typography

To guarantee pristine legibility, the application fetches and embeds **Inter Medium (weight 500)** into the generated PDFs. This provides a modern, crisp semi-bold layout. If a network delay occurs, it gracefully falls back to standard **Helvetica-Bold**.

---

## 🛠️ Tech Stack & Packages

* **Framework**: React 18 with TypeScript
* **Build System**: Vite
* **Styles**: Tailwind CSS
* **Icons**: Lucide React
* **CSV Engine**: PapaParse
* **PDF Engine**: PDF-Lib (Client-side PDF compiler)
* **Hosting**: Firebase Hosting (`mib-pdf-maker`)

---

## 💻 Local Quickstart

### Prerequisites
* Node.js v20+ or v22+ (highly recommended)
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

---

## 🔥 Deploying to Firebase Hosting

This project is pre-configured with `firebase.json` and `.firebaserc` pointing to the `mib-pdf-maker` project ID.

### 1. Authenticate with Firebase CLI
```bash
npx firebase login
```

### 2. Deploy Production Build
Build and deploy the application with a single command:
```bash
npm run build && npx firebase deploy --only hosting
```

---

## 📁 Required CSV Schema

For the batch parser, your CSV spreadsheet columns must match these exact headers:

```csv
last_name,suffix,first_name,middle_name,birthdate,phone,email,address,suite_number,city,state,zip_code,municipality,county,precinct,ward,mailing_address,mailing_city,mailing_state,mailing_zip,annual_request
```

### Smart Fields:
* **Section 4 (Mailing Address)**: If `mailing_address` is blank, the application automatically marks the "Same as above" checkbox on the Pennsylvania form.
* **Section 7 (Annual Request)**: Setting `annual_request` to `true`, `yes`, or `1` automatically overlays an `X` on the annual mail-in ballot request box.
