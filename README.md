# 🗳️ Pennsylvania Mail-in Ballot Application Batch Printer

An ultra-secure, client-side React web utility built with **Vite** and styled with **Tailwind CSS**. It enables county election offices, advocacy groups, and organizers to parse voter spreadsheets (CSV) and batch-generate filled, print-ready, official Pennsylvania Mail-in Ballot Applications (PDF) in seconds.

---

## 🔒 Security Design: Absolute PII Confidentiality

Voter databases contain critical Personally Identifiable Information (PII) like names, phone numbers, birthdates, and residential addresses. This application is engineered with a **Zero-Server storage and processing model**:

1. **Local Parsing**: The uploaded CSV spreadsheet is parsed directly inside the browser using `papaparse`.
2. **Local PDF Overlay**: Modifying and filling the official PDF template is done directly in the browser using `pdf-lib`.
3. **Consolidated Merging**: Individual pages are compiled and consolidated into a single multi-page batch download file entirely in-memory.
4. **No Remote Uploads**: **No voter data is ever sent over the network, saved on a database, or stored on a server.** Once you close the browser tab, all session data is permanently erased.

---

## 🚀 Key Features

* **Visual CSV Upload**: Clean drag-and-drop dashboard to ingest voter database spreadsheets.
* **Rigid Schema Validation**: Checks for required headers (even if blank) and automatically warns if any are missing or misnamed.
* **Circular Progress Dialog**: Shows smooth percentage completion progress as it writes ballpoint blue text onto each page.
* **Auto-Download Trigger**: Saves the finished file and initiates a batch download automatically.
* **Single Alignment Test Sheet**: Features a "Test Sheet" button next to each voter to output a single-page sample to check page margins before compiling a full 25-record batch.
* **X,Y Coordinate Precision Tuner**: Built-in visual alignment controls to "nudge" text boxes in PDF points (Origin `0,0` is at the bottom-left of Letter size `612 x 792 pt`) to calibrate for varying printers.
* **Local Sample CSV Downloader**: Downloads a pre-formatted mock CSV template so users can immediately test the application.

---

## 🛠️ Tech Stack & Packages

* **Framework**: React 18 with TypeScript
* **Build System**: Vite
* **Styles**: Tailwind CSS
* **Icons**: Lucide React
* **CSV Engine**: PapaParse
* **PDF Engine**: PDF-Lib (Client-side PDF compiler)
* **Hosting**: Firebase Hosting

---

## 💻 Local Quickstart

### Prerequisites
* Node.js v18+ 
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
This generates a production-optimized `dist/` directory ready for any static web host.

---

## 🔥 Deploying to Firebase Hosting

This project is pre-configured with `firebase.json` and a placeholder `.firebaserc`.

### 1. Authenticate with Firebase CLI
If you haven't installed the Firebase CLI or logged in, run:
```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase Link
Associate this folder with your Firebase account project:
```bash
firebase use --add
```
*Select your target Firebase project from the list, or create one in the [Firebase Console](https://console.firebase.google.com/).*

### 3. Deploy Production Build
Build and deploy the application with a single command:
```bash
npm run build && firebase deploy --only hosting
```
Once done, Firebase will output your global hosted secure HTTPS URL (e.g., `https://your-project-id.web.app`).

---

## 📁 Required CSV Schema

For the app to parse files, the CSV spreadsheet columns must match these exact headers:

```csv
last_name,suffix,first_name,middle_name,birthdate,phone,email,address,suite_number,city,state,zip_code,municipality,county,precinct,ward,mailing_address,mailing_city,mailing_state,mailing_zip,annual_request
```

### Smart Fields:
* **Section 4 (Mailing Address)**: If `mailing_address` is blank, the application automatically marks the "Same as above" checkbox on the Pennsylvania form.
* **Section 7 (Annual Request)**: Setting `annual_request` to `true`, `yes`, or `1` automatically overlays an `X` on the annual mail-in ballot request box.
