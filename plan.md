```markdown
# Detailed Implementation Plan for School Entry Tracking System

This plan outlines the steps to integrate a QR code-based school entry system with a login system (for teachers and the principal) and a principal dashboard to view daily entries. The system will connect to a Hostinger-hosted database. All features include robust error handling and follow UI/UX best practices with modern, clean interfaces.

---

## 1. Database Integration

### File: src/lib/database.ts
- **Purpose:** Connect to the Hostinger database (assumed MySQL).
- **Changes:**
  - Import and configure the "mysql2" package to set up a connection pool.
  - Read connection parameters (DB_HOST, DB_USER, DB_PASS, DB_NAME) from environment variables.
  - Create helper functions (e.g., `query`, `execute`) with appropriate error handling (try/catch, logging errors, and returning responses).
- **Best Practices:** Use connection pooling and secure environment variables.

---

## 2. Authentication Utilities

### File: src/lib/auth.ts
- **Purpose:** Provide authentication helpers for API endpoints and page protection.
- **Changes:**
  - Import "jsonwebtoken" and define functions:
    - `generateToken(userData)` to sign JWT tokens using a secret (JWT_SECRET from env).
    - `verifyToken(token)` to validate tokens.
    - Optionally, middleware for protecting API routes.
- **Error Handling:** Return detailed error responses on token verification failures.

---

## 3. User Login System

### File: src/app/login/page.tsx
- **Purpose:** Create a modern login page for teachers and principals.
- **Changes:**
  - Build a centered form with inputs for email and password.
  - Use state hooks to manage form input and error messages.
  - On form submission, call the login API endpoint.
  - Use clear typography, spacing, and a modern color scheme (e.g., white background with a contrasting button).
- **UI/UX:** Ensure form responsiveness, proper error messages, and user feedback (e.g., loading indicators).

### File: src/app/api/auth/login/route.ts
- **Purpose:** Handle login POST requests.
- **Changes:**
  - Accept JSON { email, password } in a POST request.
  - Validate credentials (against database “users” table or hard-coded demo credentials).
  - On success, generate and return a JWT token.
  - On failure, return a 401 status with a clear error message.
- **Error Handling:** Use try/catch; ensure HTTP status codes reflect errors.

---

## 4. Student Entry Recording

### File: src/app/api/entry/route.ts
- **Purpose:** Receive and record student entries via QR code scans.
- **Changes:**
  - Accept POST requests with payload { studentId: string }.
  - Validate and verify the student exists in the “students” table.
  - Insert a new entry in the “entries” table with timestamp and student ID.
  - Use authentication (verify JWT token from headers) to ensure the request is authorized.
- **Error Handling:** Return 400 for invalid data, 401 for unauthorized requests, and 500 for server/database errors.

---

## 5. QR Code Scanning Component

### File: src/components/QRScanner.tsx
- **Purpose:** Enable scanning of QR codes for student entry.
- **Changes:**
  - Implement a component using the browser’s camera API (or an approved library like "react-qr-reader" if needed) with a fallback:
    - Display a prominent scanning area.
    - Provide an alternative manual input field for QR data.
  - Style the component with modern typography, ample spacing, and a clear call-to-action.
- **Error Handling:** Display error notifications if the camera fails or scanning results are invalid.

---

## 6. QR Code Generation (Optional)

### File: src/components/StudentQRCode.tsx
- **Purpose:** Generate a QR code for a given student’s unique School ID.
- **Changes:**
  - Use the "qrcode" library to convert the student ID/data to a QR code image.
  - Render the QR code using a `<canvas>` or `<img>` element.
  - Style the output with clean typography and spacing.
- **Error Handling:** Catch generation errors and display a fallback message.

---

## 7. Principal Dashboard for Daily Entries

### File: src/app/dashboard/page.tsx
- **Purpose:** Present a dashboard for viewing student entry records by day.
- **Changes:**
  - Develop a page with a date picker (`<input type="date">`) at the top.
  - On date selection, fetch student entry records from a new API endpoint.
  - Display records in a responsive table with columns: Student ID, Student Name, and Entry Time.
  - Include states for loading and error display.
  - Use modern layout design with clear spacing and styled table elements.
- **UI/UX:** Focus on clarity and responsiveness. Ensure that even on mobile, the layout is accessible.

---

## 8. Package and Environment Setup

### File: package.json
- **Changes:**
  - Add required dependencies: "mysql2", "jsonwebtoken", "qrcode", and optionally "react-qr-reader".
- **Best Practices:** Lock dependency versions and update README with instructions regarding environment variables.

### File: .env.local (not visible in directory but must be created)
- **Settings:**
  - DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET.
- **Instructions:** Provide sample values in README for local testing.

---

## Additional UI Considerations

- **Overall Styling:** Use existing global styles (src/app/globals.css) to enforce consistency across pages.
- **Error and Loading States:** Every API call should provide user feedback with modern error texts or loading spinners.
- **Security:** Ensure that sensitive information (JWT secret, DB credentials) are never exposed on the client side.

---

## Summary

- Created `database.ts` to manage a Hostinger MySQL connection with proper error handling.
- Developed authentication utilities in `auth.ts` for JWT token generation and verification.
- Implemented a modern login page (`login/page.tsx`) and its corresponding API (`api/auth/login/route.ts`) for teachers/principal.
- Added an API route (`api/entry/route.ts`) to record student entries from QR scans.
- Built a `QRScanner.tsx` component for real-time scanning with manual fallback, and an optional `StudentQRCode.tsx` for QR code creation.
- Developed a principal dashboard (`dashboard/page.tsx`) with a date picker and responsive table layout.
- Updated `package.json` to include new dependencies and noted environment variable setup.
