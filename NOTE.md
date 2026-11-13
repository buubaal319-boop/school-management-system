# NOTE.md — School Management System (Next.js + Express + Firebase)

This file tells you **where things are** and **how to change them**.
Read "Quick map" first, then jump to the recipe you need.

---

## 1. How it fits together

```
Browser (Next.js, Tailwind)  ──token──►  Express API  ──Admin SDK──►  Firebase
   frontend/                              backend/                    Auth + Firestore
```

- **Firebase Auth** = who you are (email + password).
- **Firestore** = the data. **Only the Express API touches it.** The browser never reads Firestore directly (`backend/firestore.rules` blocks it).
- **Roles** (`admin`, `teacher`, `student`, `parent`) live in the Firestore `users` collection, and the **backend** enforces them. The frontend only hides buttons.

```
school-system/
├── NOTE.md                      ← this file
├── backend/
│   ├── .env.example             ← copy to .env (secrets, port)
│   ├── firestore.rules          ← blocks direct browser access
│   ├── scripts/
│   │   ├── create-admin.js      ← makes your first admin login
│   │   └── seed.js              ← optional sample data
│   └── src/
│       ├── server.js            ← starts Express
│       ├── config/
│       │   ├── firebase.js      ← connects to Firebase
│       │   └── resources.js     ← ⭐ THE DATA MAP (collections, fields, who may read/write)
│       ├── middleware/auth.js   ← checks the login token + role (authenticate / allow)
│       ├── routes/
│       │   ├── index.js         ← mounts everything under /api
│       │   ├── crud.js          ← generic list/get/create/update/delete from resources.js
│       │   ├── attendance.js    ← "save a whole class register" endpoint
│       │   ├── dashboard.js     ← numbers for the dashboard
│       │   └── users.js         ← create/edit login accounts (admin only)
│       └── utils/grade.js       ← score → letter grade (A–F boundaries)
└── frontend/
    ├── .env.local.example       ← copy to .env.local (Firebase web keys, API URL)
    ├── tailwind.config.js       ← ⭐ COLORS and FONTS
    └── src/
        ├── app/
        │   ├── globals.css      ← buttons, inputs, tables, cards (shared styles)
        │   ├── layout.js        ← fonts + providers
        │   ├── login/page.js    ← sign-in page
        │   └── (app)/           ← every page that needs login
        │       ├── layout.js    ← login guard + top navigation
        │       ├── dashboard/ students/ teachers/ classes/
        │       ├── subjects/ attendance/ results/ users/     (one page.js each)
        ├── components/
        │   ├── ResourcePage.js  ← ⭐ reusable list + add/edit/delete page
        │   ├── TopNav.js, PageHeader.js, Modal.js, Pill.js
        ├── config/
        │   ├── school.js        ← school name + tagline
        │   ├── nav.js           ← menu items + which roles see them
        │   └── permissions.js   ← which roles see Add/Edit/Delete buttons
        └── lib/
            ├── firebase.js      ← Firebase sign-in client
            ├── api.js           ← every call to the backend goes through here
            ├── auth-context.js  ← current user + role (useAuth)
            └── i18n.js          ← English / Somali words (useT)
```

---

## 2. First-time setup

### A. Firebase (once)
1. Go to <https://console.firebase.google.com> → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** (production mode is fine).
4. **Project settings → General → Your apps → Web (`</>`)** → register an app → copy the config values.
5. **Project settings → Service accounts → Generate new private key** → save the file as `backend/serviceAccountKey.json`.

### B. Backend
```bash
cd backend
cp .env.example .env           # keep GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
npm install
npm run create-admin -- you@school.com "StrongPassword123" "Your Name"
npm run seed                   # optional: sample classes, students, results
npm run dev                    # http://localhost:5000
```

### C. Frontend
```bash
cd frontend
cp .env.local.example .env.local   # paste the Firebase web values from step A.4
npm install
npm run dev                        # http://localhost:3000
```
Sign in with the admin you created. Then use **Users** to create teacher, student and parent logins.

> **Student / parent accounts:** when creating one, pick the **Linked student**. That is the only student's results and attendance they can see.

---

## 3. Database (Firestore collections)

| Collection | Main fields | Replaces (old SQL table) |
|---|---|---|
| `users` | name, email, role, linkedStudentIds | Users |
| `students` | fullName, admissionNo, gender, classId, **className**, guardianName, guardianPhone, status | Students |
| `teachers` | name, email, phone, subjectId, **subjectName** | Teachers |
| `classes` | name, section, academicYear, teacherId, **teacherName** | Classes |
| `subjects` | name, code | Subjects |
| `attendance` | studentId, studentName, classId, className, date, status | Attendance + AttendanceStatus |
| `results` | studentId, studentName, subjectId, subjectName, score, **grade**, examType, term, year | StudentResults |

Bold names are copied automatically by the backend (`refs` in `resources.js`) so lists show names without extra lookups. If you rename a class, existing students keep the old `className` until they are re-saved. That is the normal trade-off in Firestore.

Attendance documents are named `<date>_<studentId>`, so saving the same day twice overwrites instead of duplicating.

**Moving your old SQL Server data:** export each table to JSON/CSV and write a small script like `backend/scripts/seed.js` that adds the rows with `db.collection('students').add({...})`. Create classes and subjects first, so you can use their new Firestore ids in `classId` / `subjectId`.

---

## 4. Recipes: how to change things

### Change the colors or fonts
`frontend/tailwind.config.js`: edit the hex values under `colors` (`brand` = green, `gold` = accent, `clay` = alerts, `paper` = background). Fonts are loaded in `frontend/src/app/layout.js` (the Google Fonts `<link>`) and named in `tailwind.config.js` → `fontFamily`.

### Change the school name or tagline
`frontend/src/config/school.js`.

### Change how buttons / inputs / tables look everywhere
`frontend/src/app/globals.css` → the `@layer components` block (`.btn-primary`, `.input`, `.card`, `.th`, `.td`).

### Add a field to an existing module (example: students get a `phone`)
1. **Backend:** `backend/src/config/resources.js` → add `'phone'` to `students.fields`.
2. **Frontend:** `frontend/src/app/(app)/students/page.js` → add one line to `fields` (the form) and, if you want it in the table, one line to `columns`.

That's all. No route or controller changes.

### Add a whole new module (example: "fees")
1. `backend/src/config/resources.js` → copy the `subjects` entry, rename it `fees`, list its fields, `read`/`write` roles.
   The API `/api/fees` now exists automatically.
2. Copy `frontend/src/app/(app)/subjects/page.js` to `.../fees/page.js` and change `resource`, `fields`, `columns`.
3. `frontend/src/config/nav.js` → add a menu line. `frontend/src/config/permissions.js` → add `fees: ['admin']`.

### Change who can do what
- **Real rule (backend):** `read` and `write` arrays in `backend/src/config/resources.js`.
- **Buttons shown (frontend):** `frontend/src/config/permissions.js`.
- **Menu visibility:** `frontend/src/config/nav.js`.
Change the backend first, then keep the other two in line with it.

### Add a new role (example: "accountant")
1. `backend/src/routes/users.js` → add it to `ROLES`.
2. `backend/src/config/resources.js` → add it to the `read`/`write` arrays it needs.
3. `frontend/src/config/nav.js` and `permissions.js` → add it where it should see pages/buttons.
4. `frontend/src/app/(app)/users/page.js` → add it to the `role` options.

### Change the grade boundaries
`backend/src/utils/grade.js`. Existing results keep their old grade until re-saved.

### Add a language (e.g. Arabic)
`frontend/src/lib/i18n.js` → add an `ar: { ... }` block, then add `'ar'` to the language buttons in `frontend/src/components/TopNav.js`. Right-to-left is already switched on for `ar`. Any word you don't translate simply shows in English.

### Change the dashboard
`frontend/src/app/(app)/dashboard/page.js` (layout) and `backend/src/routes/dashboard.js` (the numbers).

---

## 5. Going live

- **Backend** (Render, Railway, a VPS…): set `CORS_ORIGIN` to your website URL, and use the three variables `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` instead of the key file. Start command: `npm start`.
- **Frontend** (Vercel or similar): set the `NEXT_PUBLIC_*` variables, with `NEXT_PUBLIC_API_URL` pointing to `https://your-api/api`. Build: `npm run build`.
- Deploy the rules: `firebase deploy --only firestore:rules`.
- In Firebase → Authentication → Settings → **Authorized domains**, add your website domain.

## 6. Security reminders
- Never commit `.env`, `.env.local` or `serviceAccountKey.json` (already in `.gitignore`).
- The old project shipped a `.env` with SQL Server credentials. **Change that database password** if the archive was ever shared.

## 7. Troubleshooting
| Problem | Likely cause |
|---|---|
| "Cannot reach the server" | Backend not running, or `NEXT_PUBLIC_API_URL` wrong |
| Login works then immediately returns to login with "no role" | The account has no document in `users`. Create it from the **Users** page, or run `create-admin` |
| "Session expired" on every call | Backend uses a different Firebase project than the frontend |
| Browser console shows a CORS error | `CORS_ORIGIN` in `backend/.env` doesn't match the site URL |
| Teacher can't see a page | Check `nav.js` roles **and** `resources.js` read roles |
