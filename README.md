# X-Ray Fracture Detection — Frontend

React + TypeScript frontend for a medical imaging platform. Doctors upload X-rays, a YOLOv8 service detects and classifies bone fractures, and the results become reports that patients can view and download.

Built as part of a 2-person final-year project. This repository holds the frontend I built. The Go/Fiber backend and the YOLOv8 detection service were built by [@medr00t](https://github.com/medr00t) and live in [FractureXrayAnalyzer](https://github.com/medr00t/FractureXrayAnalyzer).

## Roles

Three roles, each with its own routes and permissions:

| Role | Can do |
|---|---|
| Chef (admin) | Create doctor accounts, register patients, run analyses |
| Doctor | Register patients, upload and analyze X-rays, view and delete own reports, notify patients by email |
| Patient | View own reports, download them as PDF |

## Authentication

JWT, decoded client-side with `jwt-decode`.

- `AuthContext` holds auth state in a `useReducer` (`INIT`, `LOGIN_SUCCESS`, `AUTH_FAILURE`, `LOGOUT`).
- On login the token is stored in `localStorage` under `jwt`, decoded for `userId`, `role` and `email`, and the user is put in context.
- On mount the provider re-reads the token and checks `exp` against the current time. Expired tokens are cleared and the session starts logged out, so a stale token never leaves the UI in a half-authenticated state.
- `ProtectedRoute` gates routes on `isAuthenticated` and role; `RedirectIfAuthenticated` keeps logged-in users off the login and register pages.
- Every API call attaches `Authorization: Bearer <token>`.

## Data model

Types in `src/types/index.ts` mirror the MongoDB collections:

**User** — `id`, `fullName`, `email`, `role`, `createdBy`, `createdAt`. `createdBy` records which chef or doctor created the account, so admins and doctors only see the users they registered.

**Report / EnrichedReport** — a report references a patient and a doctor. The enriched form the API returns embeds both `User` objects plus `imageName`, `annotatedImage`, `fractureType`, `recoveryTime` and `confidence`, so the report list renders without extra lookups.

**Analysis** — the detection result: original and annotated image URLs, `fractureType`, `fractureLocation`, `recoveryTimeDays`, `confidence`, `suspectedFracture`, and an optional list of `FractureAnnotation`.

**FractureAnnotation** — one bounding box: `x`, `y`, `width`, `height`, `fractureType`, `confidence`, plus `corrected` and `originalCoordinates` so a doctor's manual correction can be kept alongside what the model originally predicted.

## Analysis flow

1. `UploadPage` collects the X-ray image and patient details and builds a `FormData`.
2. `createReport` posts it to `POST /api/reports/create` with the bearer token.
3. The backend forwards the image to the YOLOv8 service and returns the analysis plus the created report.
4. `ResultsPage` renders the outcome: `AnnotatedImage` draws the bounding boxes over the X-ray, `ResultCard` shows fracture type, confidence and estimated recovery time.
5. `PdfReportTemplate` turns the report into a downloadable PDF.
6. Patients reach their own reports through `MyReportsPage`, which calls `POST /api/reports/my-reports`.

## Structure

```
src/
├── pages/          Route-level views: Home, Login, Register, Upload, Results,
│                   History, MyReports, Profile, AddDoctor, NotFound
├── components/
│   ├── auth/       Login form
│   ├── upload/     ImageUploader, PatientInfoForm
│   ├── results/    AnnotatedImage, ResultCard, PdfReportTemplate
│   ├── history/    HistoryList
│   ├── layout/     Header, Footer, MainLayout, PageContainer
│   └── common/     ProtectedRoute, RedirectIfAuthenticated
├── context/        AuthContext — JWT state, role, session lifecycle
├── api/            auth.ts, analysis.ts — fetch layer, typed ApiResponse<T>
├── types/          Shared domain types
└── utils/          jwt helpers
```

Every API call goes through a typed `ApiResponse<T>` (`data`, `error`, `status`), so pages handle failures uniformly instead of each one catching its own errors.

## Stack

React · TypeScript · Vite · Tailwind CSS · React Router · jwt-decode

## Running locally

```bash
npm install
npm run dev
```

Expects the backend on `http://localhost:3000`. See [the API and detection service](https://github.com/medr00t/FractureXrayAnalyzer).
