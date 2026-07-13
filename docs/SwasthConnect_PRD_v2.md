# SwasthConnect — Product Requirements Document

**SwasthConnect**
Telemedicine Access for Rural & Low-Literacy Communities

---

| Field | Details |
|---|---|
| **Document Owner** | Product Owner |
| **Version** | 2.0 |
| **Status** | Final Draft |
| **Last Updated** | July 2026 |
| **Platform** | Web App — React + Node.js |

---

## Table of Contents

1. Executive Summary
2. Problem Statement
3. Goals & Objectives
4. Target Users & Personas
5. Competitive Analysis & Gap Identification
6. Scope
7. Core Features
8. Key User Flows
9. Non-Functional Requirements
10. Technical Overview
11. Success Metrics
12. Risks & Mitigations
13. Future Considerations

---

## 1. Executive Summary

SwasthConnect is a full-stack telemedicine platform designed to close the healthcare access gap for rural and semi-urban populations in India. Unlike mainstream telemedicine apps built for urban, English-literate users, SwasthConnect is designed around the real constraints of its target population: regional language preference, limited literacy, and the absence of pre-consultation structure that makes existing platforms ineffective.

The platform's defining feature is its **AI-powered pre-consultation triage system** — the only telemedicine platform in India where the doctor receives a structured clinical summary of the patient's symptoms, history, and urgency level *before* the call begins. This directly addresses the most documented failure mode of existing platforms like eSanjeevani: doctors receiving patients with zero context, leading to inefficient consultations and inappropriate specialist referrals.

Beyond triage, SwasthConnect provides smart doctor discovery with AI-powered symptom-to-specialisation matching, a real-time SSE-powered waiting room, WebRTC video consultation with audio-only fallback, structured prescription generation, a patient health timeline, post-consultation follow-up intelligence, and full regional language support across the entire app — including voice input for symptom description.

---

## 2. Problem Statement

Access to timely, quality medical consultation remains a significant challenge in rural India. The numbers are stark:

- India's doctor-patient ratio stands at approximately 1:1456, well below the WHO-recommended 1:1000, with the shortfall concentrated in rural areas.
- Rural Community Health Centers face a 70% specialist vacancy rate.
- Rural patients often travel over 100 kilometres to access medical care, incurring both financial and time costs.
- Only 50% of rural households have government health insurance; 34% have none.

Existing telemedicine platforms fail to bridge this gap for three compounding reasons:

**Reason 1 — No pre-consultation structure.** Doctors receive patients cold, with no symptom context. eSanjeevani research documents high rates of inappropriate referrals and inefficient consultations as a direct result. Practo and MFine have no triage layer either.

**Reason 2 — Language exclusion.** eSanjeevani operates in English only. For the 700+ million Indians whose primary language is not English, this is a fundamental barrier. A Bhashini-integrated translation feature for eSanjeevani is only being piloted now, years after launch.

**Reason 3 — Wrong specialisation routing.** Patients don't know which specialist to see. eSanjeevani data shows high rates of referrals to wrong specialities. Platforms that offer specialisation filters require patients to already know what they need.

SwasthConnect addresses all three failures as first-class product requirements.

---

## 3. Goals & Objectives

### 3.1 Product Goals

- Enable patients anywhere to consult a verified doctor remotely, in their own language.
- Give doctors structured, AI-generated patient context before every consultation — eliminating the information gap that makes existing platforms ineffective.
- Route patients to the right specialist automatically, based on plain-language symptom description.
- Build a complete, continuous care loop: booking → triage → consultation → prescription → follow-up → health history.

### 3.2 Technical Goals

- Demonstrate production-realistic full-stack architecture: REST API, real-time (SSE), WebRTC, AI integration, background jobs, file generation, and cloud deployment.
- Maintain clean separation of concerns: routes → controllers → services → database.
- Deploy on permanent free-tier infrastructure (Vercel + Render + Neon) with a live, demoable URL.

### 3.3 Resume / Portfolio Goals

- Show end-to-end product thinking: problem identification → gap analysis → feature design → technical execution.
- Cover the full SDE interview surface: auth, API design, DB schema, real-time, AI integration, file handling, deployment, and system design tradeoffs.

---

## 4. Target Users & Personas

### Persona 1 — Rural Patient (Primary)

| Attribute | Detail |
|---|---|
| Language | Prefers Hindi, Kannada, Tamil, Telugu, or Bengali |
| Literacy | Low to moderate; limited English |
| Device | Basic Android smartphone |
| Connectivity | 2G/3G, intermittent |
| Behaviour | Delays care due to travel cost and distance; unfamiliar with medical terminology |
| Core Need | Consult a doctor in own language, describe symptoms by speaking, receive a prescription without travel |

### Persona 2 — Family Member / Caregiver

| Attribute | Detail |
|---|---|
| Profile | Books and manages consultations on behalf of elderly or less tech-literate relative |
| Core Need | Simple, guided booking flow; easy access to past prescriptions |

### Persona 3 — Doctor / Provider

| Attribute | Detail |
|---|---|
| Profile | Urban or semi-urban clinician offering remote consultations |
| Core Need | Receive structured patient information before the call; manage daily queue by urgency; write and send prescriptions efficiently |

### Persona 4 — ASHA / Community Health Worker (Future)

| Attribute | Detail |
|---|---|
| Profile | Assists rural patients in accessing the platform |
| Core Need | Assisted-booking mode; ability to register patients on their behalf |

---

## 5. Competitive Analysis & Gap Identification

### 5.1 Existing Platforms

| Platform | Best Features | Critical Gaps |
|---|---|---|
| **eSanjeevani** | Free; 163M+ consultations; large doctor network; nationwide reach | English-only; no pre-consultation triage; inappropriate referrals; no feedback loops; no health continuity |
| **Practo** | Large verified network; clean UI; medicine ordering | Paid; no AI triage; video call failures reported; doctor availability often inaccurate |
| **MFine / Lybrate** | Symptom-based doctor matching; affordable entry | Matching is filter-only, not AI; no triage summary for doctor; async chat dominates; no health records |

### 5.2 Common Gaps Across All Platforms

| Gap | eSanjeevani | Practo | MFine |
|---|---|---|---|
| AI pre-consultation triage | ✗ | ✗ | ✗ |
| Doctor receives patient context before call | ✗ | ✗ | ✗ |
| Urgency-based queue prioritisation | ✗ | ✗ | ✗ |
| AI symptom-to-specialisation routing | ✗ | ✗ | Partial (filter only) |
| Real-time waiting room with live status | ✗ | ✗ | ✗ |
| Post-consultation follow-up with feedback loop | ✗ | ✗ | ✗ |
| Regional language UI | ✗ | ✗ | ✗ |
| Voice input for symptoms | ✗ | ✗ | ✗ |
| Structured patient health timeline | ✗ | Partial | ✗ |
| Doctor quality scoring (multi-dimension) | ✗ | Star rating only | Star rating only |

### 5.3 SwasthConnect's Unique Selling Proposition

> **"The only telemedicine platform where the doctor is prepared before the call starts."**

SwasthConnect treats the consultation as the *ending point* of a preparation pipeline — not the starting point. Every consultation is preceded by an AI-generated clinical summary that gives the doctor the patient's chief complaint, symptom duration, severity, relevant medical history, current medications, and urgency level before admitting the patient. This is a direct, research-backed solution to the most documented failure in Indian telemedicine.

---

## 6. Scope

### 6.1 In Scope (v1)

- Patient and doctor registration with role-based access
- Regional language UI — Hindi, Kannada, Tamil, Telugu, Bengali, English (i18next)
- Voice input for symptom description (Web Speech API, language-matched)
- AI-powered symptom-to-specialisation matching (Gemini Flash)
- Doctor discovery with quality scores and availability slots
- Appointment booking with slot management
- AI triage — structured symptom form → Gemini Flash → clinical summary + urgency level
- Real-time waiting room (SSE)
- WebRTC video consultation with audio-only fallback (PeerJS)
- Prescription generation (pdfkit → Cloudinary)
- Patient health timeline
- Post-consultation rating (4-dimension quality score)
- Post-consultation follow-up (node-cron, 3-day ping, doctor flag on worsening)
- Deployment: Vercel (frontend) + Render (backend) + Neon PostgreSQL

### 6.2 Out of Scope (v1)

- Native iOS/Android apps
- Insurance claims integration
- Pharmacy / medicine delivery integration
- Payment gateway
- Offline symptom capture with sync
- ASHA/community health worker assisted-booking mode
- SMS reminders (in-app notifications only)
- AI diagnosis (triage generates summaries, not diagnoses)

---

## 7. Core Features

---

### Feature 1 — Auth & Role-Based Access

**Description:** Secure registration and login for patients and doctors with JWT-based authentication and role-based access control.

**Patient registration fields:** Full Name, Email, Password, Age, Gender, Blood Group, Preferred Language (EN/HI/KN/TA/TE/BN)

**Doctor registration fields:** Full Name, Email, Password, Specialisation, Years of Experience, Medical License Number, Bio, Consultation Fee (₹)

**Auth behaviour:**
- Passwords hashed with bcrypt
- JWT issued on login, stored in client localStorage
- Sent as `Authorization: Bearer <token>` header on all protected requests
- Role detected from JWT payload — no manual role selector on login
- Role-based middleware on backend: patient-only routes and doctor-only routes enforced server-side
- Role-based redirects on frontend: patients → Patient Dashboard, doctors → Doctor Dashboard

**Doctor onboarding step:** After first registration, doctor is required to set availability slots before accessing the dashboard (day of week, start time, end time, multiple slots per day).

---

### Feature 2 — Smart Doctor Discovery & Appointment Booking

**Description:** Patients describe symptoms in plain language → AI recommends the right specialisation → filtered doctor listing with quality scores → slot booking.

**Symptom-to-Specialisation Matching:**
- Patient types or speaks their symptoms on the Find a Doctor page
- Backend sends symptom text to Gemini Flash with prompt:
  *"Based on the following patient-reported symptoms, recommend the most appropriate medical specialisation from this list: [list]. Return only the specialisation name and a one-line reason."*
- AI recommendation displayed as a banner: "Based on your symptoms, we recommend a Cardiologist"
- Doctor list filtered to that specialisation by default; patient can override and browse all

**Doctor Cards display:**
- Name, verified badge, specialisation, years of experience
- Quality score (overall average + consultation count)
- Next available slot
- Consultation fee (₹)
- "Book Consultation" button

**Doctor Profile page:**
- Full bio and experience
- 4-dimension quality score breakdown (Clarity, Time Given, Prescription Quality, Overall)
- Available slot grid by day — patient selects a slot
- "Book & Continue to Triage" CTA

**Appointment creation:**
- Appointment row created in DB with status `PENDING`
- Patient immediately redirected to AI Triage form

---

### Feature 3 — AI Pre-Consultation Triage (USP)

**Description:** Before every consultation, the patient completes a structured symptom intake form. The backend sends this to Gemini Flash, which generates a structured clinical summary and urgency level for the doctor. This summary is stored in the database and surfaced to the doctor before and during the call.

**This is SwasthConnect's defining feature — the one thing no existing Indian telemedicine platform does.**

**Triage Form Fields:**
1. Primary symptoms (text area + voice input mic button)
2. Duration (pill selector: 1-2 days / 3-5 days / 1 week / more than a week)
3. Severity (slider: Mild → Moderate → Severe)
4. Existing medical conditions (multi-select chips: Diabetes, Hypertension, Heart Disease, Asthma, None, + custom)
5. Current medications (optional text field)
6. Recent changes (multi-select: Travelled recently, Change in diet, High stress, None)

**Voice Input Behaviour:**
- Mic button on symptom field triggers Web Speech API
- Recognition language automatically set to user's selected app language (hi-IN, ta-IN, kn-IN, te-IN, bn-IN, en-IN)
- Transcribed text shown in field for user to confirm or edit before submission
- Text fallback always available

**Multilingual Handling:**
- Patient may write or speak in any supported regional language
- Gemini Flash prompt includes instruction to translate if needed and always return the clinical summary in English
- Doctor always receives English summary regardless of patient's input language
- Original patient input also stored and displayed alongside the English summary (for doctor reference)

**Gemini Flash Prompt:**
```
You are a medical triage assistant. The following symptom information 
was submitted by a patient and may be written in any Indian language. 
Translate if needed. Generate a structured pre-consultation summary 
for the doctor. 

Do NOT diagnose. Do NOT suggest treatments.

Return ONLY a JSON object with these fields:
{
  "chief_complaint": "string",
  "duration": "string",
  "severity": "Mild | Moderate | Severe",
  "relevant_history": "string",
  "current_medications": "string",
  "urgency": "ROUTINE | PRIORITY | EMERGENCY",
  "summary": "2-3 sentence clinical summary in English for the doctor"
}

Patient input: [symptom form data]
```

**Urgency Level Logic (guided by Gemini):**
- `ROUTINE` — minor symptoms, no red flags, non-urgent
- `PRIORITY` — significant symptoms or relevant comorbidities, needs attention
- `EMERGENCY` — red flag symptoms (chest pain + breathlessness, altered consciousness, severe pain, etc.) — doctor queue sorts these to top

**Triage Summary Storage:**
- Stored in `triage_summaries` table linked to appointment
- Appointment status updated from `PENDING` → `TRIAGED`
- Displayed to doctor on: dashboard queue card, consultation room right panel

---

### Feature 4 — Real-Time Waiting Room

**Description:** After submitting triage, the patient enters a waiting room. A live Server-Sent Events (SSE) connection keeps the patient informed of their status and automatically redirects them when the doctor admits them.

**Why SSE and not WebSockets:** The waiting room is a one-directional push from server to patient browser. SSE is lighter, simpler, and the correct tool for this use case — a deliberate design decision worth explaining in interviews.

**Patient Waiting Room Screen:**
- Pulsing animation indicating active wait
- "Waiting for Dr. [Name] to admit you..." status text
- Doctor info (name, specialisation)
- Scheduled appointment time
- Live "Doctor is online" indicator (green dot)
- Preview of triage summary that was sent to doctor
- Urgency badge (ROUTINE / PRIORITY / EMERGENCY)

**SSE Flow:**
1. Patient enters waiting room → `GET /api/waiting-room/stream` → SSE connection opened
2. Appointment status updated to `WAITING`
3. Doctor's dashboard receives SSE event: "Patient [Name] is now waiting"
4. Doctor reviews triage summary → clicks "Admit Patient"
5. `PATCH /api/appointments/:id/status` → status `ACTIVE`
6. SSE pushes event to patient browser: `{ event: "admitted" }`
7. Patient browser auto-redirects to `/call/:appointmentId`

**Edge Cases:**
- Patient waits more than 30 minutes with no admission → appointment status auto-set to `EXPIRED` by a cron check
- Patient can cancel from waiting room (status → `CANCELLED`)
- SSE connection drops → client auto-reconnects with exponential backoff

---

### Feature 5 — Video Consultation

**Description:** WebRTC peer-to-peer video call between patient and doctor, facilitated by a self-hosted PeerJS signaling server running on the same Express backend.

**Why PeerJS self-hosted (not cloud):** PeerJS public cloud has connection limits and is unsuitable for a portfolio project with a live URL. Self-hosting PeerServer on the same Express app shows understanding of the signaling layer — a genuine interview talking point.

**Video Call Room Layout:**
- Full-screen dark mode (only dark screen in the app)
- Large video feed (doctor, from patient's perspective)
- Picture-in-picture: patient's own feed (bottom right, draggable)
- Controls bar (bottom center): Mute, Video Off, Speaker, End Call (red)
- Live timer and connection quality indicator (top bar)
- Right panel (desktop): Patient triage summary card — always visible to doctor during call
  - Chief complaint, duration, severity, urgency badge
  - Existing conditions, current medications
  - AI-generated summary paragraph
  - Doctor's notes textarea (doctor only)

**Low-Bandwidth Handling:**
- PeerJS allows constraining video resolution and bitrate
- Default video: 320×240 at low bitrate (suitable for 3G)
- If video quality degrades repeatedly → automatic switch to audio-only
- Yellow banner shown when audio-only fallback activates: "Video connection weak — switched to audio only. Call is still active."
- Patient can manually toggle audio-only from controls

**Call Lifecycle:**
- Both parties connect to PeerServer using `appointmentId` as room identifier
- Doctor initiates call (caller); patient receives (callee)
- Either party can end call → status updated to `CALL_ENDED`
- Doctor redirected to Prescription Form after call ends

---

### Feature 6 — Prescription Generation

**Description:** After the call, the doctor fills a structured prescription form. The backend generates a PDF using pdfkit, uploads to Cloudinary, and sends the download URL to the patient's dashboard.

**Prescription Form Fields (Doctor):**
- Diagnosis (text)
- Medicines — repeatable rows: Medicine Name, Dosage, Frequency (Once/Twice/Thrice daily), Duration, Special Instructions
- Doctor's notes (textarea)
- Follow-up required? (toggle → date picker if yes)
- Refer to specialist? (toggle → specialisation + reason if yes)

**PDF Generation:**
- pdfkit generates PDF with: SwasthConnect header, patient details, consultation date, doctor details, medicine table, doctor notes, follow-up date (if any), QR code placeholder, doctor signature area
- PDF uploaded to Cloudinary
- Cloudinary URL stored in `consultations` table
- Appointment status → `COMPLETED`

**Patient Experience:**
- Post-call screen shows: "Your prescription is ready"
- Download Prescription PDF button
- "Added to your Health Timeline ✓"
- Rating prompt appears below prescription

---

### Feature 7 — Post-Consultation Rating & Doctor Quality Score

**Description:** Immediately after each consultation, the patient rates the doctor on 4 specific dimensions. Ratings aggregate into a visible quality score on the doctor's profile and booking cards.

**4 Rating Dimensions (1-5 stars each):**
1. Clarity of Explanation
2. Time Given
3. Prescription Quality
4. Overall Experience

**Quality Score Calculation:**
- Per-dimension average across all consultations
- Overall score = average of all 4 dimension averages
- Displayed on: doctor cards (Find a Doctor), doctor profile, doctor dashboard stats
- Shown as: "★ 4.2 (124 consultations)"

**Behaviour:**
- Rating screen shown on post-call page (cannot skip to dashboard without seeing it, but can skip the rating itself)
- "Skip for now" link available
- Ratings stored in `ratings` table; doctor's aggregated score recalculated on every new rating submission

---

### Feature 8 — Patient Health Timeline

**Description:** A chronological view of every past consultation — triage summary, doctor notes, diagnosis, prescription, rating given, and follow-up response — in one place. Directly addresses the zero continuity of care gap in eSanjeevani.

**What each timeline entry shows:**
- Date badge + Doctor name + Specialisation + Urgency badge
- Triage section: symptoms submitted, duration, severity
- Consultation section: Diagnosis, Doctor's notes
- Prescription: Download PDF button
- Follow-up: If scheduled — date; If follow-up response submitted — patient's response (Better/Same/Worse)
- Rating given

**Behaviour:**
- Entries sorted newest first
- Collapsed by default; click to expand full details
- Filter by date range, specialisation, doctor name
- Doctor can also view a patient's history (read-only) before and during consultation
- All text displayed in patient's selected language where applicable (doctor notes remain in English)

---

### Feature 9 — Post-Consultation Follow-Up Intelligence

**Description:** 3 days after every completed consultation, the patient receives a follow-up prompt on their dashboard asking how they're feeling. Their response is logged, and if they report worsening symptoms, the doctor is flagged on their dashboard.

**This directly addresses the "absence of feedback loops" documented as a critical failure in eSanjeevani research.**

**Implementation:**
- `node-cron` job scheduled to run nightly at 8:00 PM
- Job queries: appointments with status `COMPLETED` where `completed_at` is exactly 3 days ago and no `follow_up_request` exists yet
- Creates a `follow_up_requests` row for each qualifying appointment
- Patient sees a banner on next dashboard load:

```
"How are you feeling after your consultation with Dr. Sharma on [date]?"
[😊 Better]  [😐 Same]  [😟 Worse]
```

**Response Outcomes:**

| Response | Patient sees | Doctor sees |
|---|---|---|
| Better | "Great! Stay healthy." | Nothing |
| Same | "Consider booking a follow-up if symptoms persist" + Quick rebook button | Nothing |
| Worse | "We've notified your doctor. Book urgent consultation or visit hospital if emergency." + Urgent rebook button | ⚠️ Flag on dashboard: "Patient [Name] reported worsening symptoms after consultation on [date]. Chief complaint: [from triage]" |

**Follow-up States:**
- `PENDING` → follow-up created, patient hasn't responded
- `COMPLETED` → patient responded
- `EXPIRED` → patient didn't respond within 7 days (no further action)

**Testing Note:** During development, cron schedule temporarily changed to every minute for testing; a manual trigger route `POST /api/followup/trigger` added for demo purposes only.

---

### Feature 10 — Regional Language Support

**Description:** The entire SwasthConnect UI renders in the patient's preferred language. Language is selected on first launch and can be changed at any time. The doctor-facing UI remains in English.

**Supported Languages:**
- English (en)
- Hindi — हिन्दी (hi)
- Kannada — ಕನ್ನಡ (kn)
- Tamil — தமிழ் (ta)
- Telugu — తెలుగు (te)
- Bengali — বাংলা (bn)

**Implementation:**
- i18next + i18next-browser-languagedetector in React
- Per-language JSON translation files under `/locales/{lang}/translation.json`
- Every UI string uses `t('key')` — no hardcoded English text in components
- Language selector shown on: first launch (mandatory), registration form, navbar (globe icon), Settings page
- Selected language stored in: `users.preferred_language` (DB) + localStorage
- Language detection order: user profile → localStorage → browser locale → English default
- `LanguageContext` shared across app so Web Speech API locale and i18next locale stay in sync

**Voice Input Language Mapping:**

| App Language | Web Speech API Locale |
|---|---|
| English | en-IN |
| Hindi | hi-IN |
| Kannada | kn-IN |
| Tamil | ta-IN |
| Telugu | te-IN |
| Bengali | bn-IN |

**Triage + AI — Multilingual Handling:**
- Patient writes/speaks symptoms in any supported language
- Gemini Flash prompt instructs: translate if needed, return clinical summary always in English
- Doctor sees: English summary + original patient input shown side-by-side (for reference and accuracy validation)
- Prescription PDF generated in English (medical standard)

**Doctor side:** Doctor UI remains in English throughout. Language feature is patient-facing only.

---

## 8. Key User Flows

### 8.1 Patient — Full Consultation Journey

```
Register (select preferred language)
        ↓
Login → Patient Dashboard
        ↓
Click "Find a Doctor"
Type/speak symptoms → AI recommends specialisation
Browse filtered doctor list (with quality scores)
Select doctor → View profile → Pick slot
Click "Book & Continue to Triage"
        ↓
Appointment created (status: PENDING)
        ↓
AI Triage Form
Fill symptoms (voice or text, in own language)
Submit → Gemini Flash generates clinical summary + urgency
Triage summary stored (status: TRIAGED)
        ↓
On appointment day:
Click "Join Waiting Room"
SSE connection opens
Patient sees live status + triage preview
        ↓
Doctor reviews triage → clicks "Admit Patient"
SSE event fires → Patient auto-redirected to call
(status: ACTIVE)
        ↓
WebRTC video call
Doctor sees triage summary on screen throughout
        ↓
Call ends
Doctor fills prescription form
PDF generated → Cloudinary → URL stored
(status: COMPLETED)
        ↓
Patient: Post-call screen
Download prescription
Rate consultation (4 dimensions)
        ↓
3 days later:
Follow-up banner on dashboard
Patient responds: Better / Same / Worse
If Worse → Doctor flagged
        ↓
Health Timeline updated with full entry
```

### 8.2 Doctor — Daily Flow

```
Login → Doctor Dashboard
        ↓
See today's queue sorted by urgency:
🔴 EMERGENCY → 🟠 PRIORITY → 🔵 ROUTINE
Each card shows: patient name, age, 
chief complaint, urgency badge, 
scheduled time, waiting status
        ↓
Check for ⚠️ flagged follow-up alerts
(patients who reported worsening symptoms)
        ↓
Click "View Triage" on a patient card
Read full clinical summary before admitting
        ↓
Patient is in waiting room →
"Admit Patient" button becomes active
Click → SSE fires → Video call room opens
        ↓
During call:
See triage summary in right panel
Write consultation notes in real-time
        ↓
End call → Prescription form
Fill diagnosis, medicines, notes, follow-up
Submit → PDF generated → Patient notified
        ↓
Queue updates: next patient
```

### 8.3 Language Change Flow

```
Settings → Language → Select new language
UI re-renders instantly (i18n.changeLanguage())
Voice input locale updates to match
Preference saved to DB + localStorage
```

### 8.4 Post-Consultation Follow-Up Flow

```
[3 days after consultation]
Cron job runs at 8:00 PM
Identifies qualifying completed appointments
Creates follow_up_requests row
        ↓
Patient next logs in →
Follow-up banner shown on dashboard
Patient clicks: Better / Same / Worse
        ↓
IF Worse:
  → Doctor dashboard shows ⚠️ flag
  → Patient sees urgent rebook prompt
IF Same:
  → Patient sees follow-up suggestion
IF Better:
  → Logged, no further action
```

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Initial app load under 3 seconds on 3G simulation; lazy-loaded routes for non-critical screens; code-split by route |
| **Accessibility** | Large touch targets; icon-supported navigation; native-script language labels; no text-only cues for critical actions |
| **Reliability** | Graceful audio-only fallback when video degrades; SSE auto-reconnect with exponential backoff; PeerJS fallback to Daily.co if signaling fails |
| **Security** | bcrypt password hashing; JWT with expiry; HTTPS in production; patient health data access-controlled to patient + treating doctor only; environment variables for all secrets |
| **Data Efficiency** | Compressed API responses (gzip); low-resolution video default (320×240); minimal asset sizes; lazy-loaded images |
| **Scalability** | i18next architecture allows new languages without code changes; new specialisations added via DB, not code; stateless backend supports horizontal scaling |
| **Localization** | All UI strings in translation JSON files; no hardcoded text in React components; language context drives both UI and voice input |
| **AI Safety** | Gemini prompt explicitly instructs: do not diagnose, do not suggest treatments; triage output framed as clinical summary only; urgency levels are routing signals, not medical advice |

---

## 10. Technical Overview

### 10.1 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React + TailwindCSS | Component reusability, utility-first styling |
| Localization | i18next + i18next-browser-languagedetector | Industry standard, supports JSON translation files |
| Voice Input | Web Speech API | Free, browser-native, supports all 6 target languages |
| Backend | Node.js + Express | Team's primary stack; large ecosystem |
| ORM | Prisma | Type-safe DB access, clean migrations |
| Database | PostgreSQL via Neon | Permanent free tier, Prisma-compatible, serverless |
| Auth | JWT + bcrypt | Self-built — demonstrates fundamentals |
| AI | Google Gemini Flash 1.5 | Free tier (1M tokens/day), multilingual, reliable |
| Video | PeerJS (self-hosted PeerServer) | WebRTC abstraction, 1-on-1 calls, self-hosted = no limits |
| Real-time | SSE (Server-Sent Events) | One-directional push (server → client); lighter than WebSockets for this use case |
| File Generation | pdfkit | PDF generation in Node.js, no external service |
| File Storage | Cloudinary | Permanent free tier (25GB), simple upload API |
| Background Jobs | node-cron | In-process scheduler for follow-up ping; no additional infrastructure |
| Frontend Deploy | Vercel | Permanent free tier, optimised for React |
| Backend Deploy | Render | Permanent free tier (with cold start acceptable for portfolio) |

### 10.2 Architecture Overview

```
VERCEL (React Frontend)
│
├── Patient pages
│   ├── Auth (register/login)
│   ├── Dashboard
│   ├── Find a Doctor
│   ├── AI Triage Form
│   ├── Waiting Room (SSE listener)
│   ├── Video Call Room (PeerJS client)
│   ├── Post-Call (rating + prescription)
│   └── Health Timeline
│
└── Doctor pages
    ├── Dashboard + Queue
    ├── Video Call Room (PeerJS client)
    ├── Prescription Form
    └── Profile / Availability
         │
         │ HTTPS (Axios + JWT header)
         │ SSE stream
         │ PeerJS WebRTC signaling
         ▼
RENDER (Node.js + Express Backend)
│
├── /api/auth              JWT auth, registration, login
├── /api/doctors           Listing, profiles, availability
├── /api/appointments      Booking, queue, status management
├── /api/triage            Gemini Flash integration
├── /api/consultations     Notes, prescription generation
├── /api/ratings           Quality score system
├── /api/followup          Follow-up responses, doctor flags
├── /api/waiting-room/stream   SSE endpoint
├── /peerjs                Self-hosted PeerServer
│
├── SERVICES
│   ├── gemini.service.js      Triage prompt + response parsing
│   ├── cloudinary.service.js  PDF upload
│   ├── pdf.service.js         pdfkit prescription generation
│   └── cron.service.js        node-cron follow-up job
│
└── NEON PostgreSQL (via Prisma)
```

### 10.3 Database Schema

```
users
  id, name, email, password_hash, role (PATIENT|DOCTOR),
  preferred_language (EN|HI|KN|TA|TE|BN), created_at

doctor_profiles
  id, user_id (FK → users), specialisation, bio,
  experience_years, consultation_fee, license_number

availability_slots
  id, doctor_id (FK → doctor_profiles),
  day_of_week, start_time, end_time

appointments
  id, patient_id (FK → users), doctor_id (FK → users),
  scheduled_at, status (PENDING|TRIAGED|WAITING|ACTIVE|
  CALL_ENDED|COMPLETED|CANCELLED|EXPIRED)

triage_summaries
  id, appointment_id (FK → appointments),
  raw_symptoms (JSONB), original_input_language,
  original_patient_text (TEXT),
  ai_summary (TEXT), chief_complaint (TEXT),
  duration (TEXT), severity (TEXT),
  urgency (ROUTINE|PRIORITY|EMERGENCY), created_at

consultations
  id, appointment_id (FK → appointments),
  diagnosis (TEXT), doctor_notes (TEXT),
  prescription_url (TEXT), follow_up_date (DATE),
  referral_specialisation (TEXT), created_at

ratings
  id, appointment_id (FK → appointments),
  patient_id (FK → users), doctor_id (FK → users),
  clarity (INT 1-5), time_given (INT 1-5),
  prescription_quality (INT 1-5),
  overall (INT 1-5), created_at

follow_up_requests
  id, appointment_id (FK → appointments),
  sent_at, response (BETTER|SAME|WORSE|null),
  responded_at, doctor_flagged (BOOLEAN), seen_by_doctor (BOOLEAN)
```

### 10.4 Key API Routes

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/doctors                    (with specialisation filter)
GET    /api/doctors/:id
PUT    /api/doctors/profile
PUT    /api/doctors/availability

POST   /api/appointments               (patient books)
GET    /api/appointments/my            (patient's appointments)
GET    /api/appointments/queue         (doctor's queue, sorted by urgency)
PATCH  /api/appointments/:id/status    (admit, complete, cancel)

POST   /api/triage                     (Gemini Flash call)
GET    /api/triage/:appointmentId

POST   /api/consultations              (doctor saves notes)
GET    /api/consultations/:appointmentId
GET    /api/consultations/my           (patient history)
POST   /api/prescriptions/generate     (pdfkit → Cloudinary)

POST   /api/ratings                    (patient submits rating)
GET    /api/doctors/:id/rating         (aggregated quality score)

POST   /api/followup/:appointmentId/respond
GET    /api/followup/pending           (patient's pending follow-ups)
GET    /api/followup/flags             (doctor's flagged follow-ups)

GET    /api/waiting-room/stream        (SSE endpoint)
POST   /api/room/create
GET    /api/room/:appointmentId
```

---

## 11. Success Metrics

| Metric | Signal |
|---|---|
| Triage completion rate | % of booked appointments where triage form was submitted before the call |
| AI summary quality | Doctor's post-call rating of prescription quality (proxy for triage usefulness) |
| Voice input adoption | % of triage submissions made via voice vs. typed text |
| Language distribution | Spread across 6 supported languages |
| Urgency distribution | % of consultations at each urgency level (validates AI routing) |
| Consultation completion rate | % of TRIAGED appointments reaching COMPLETED status |
| Audio fallback rate | Frequency of video → audio downgrades |
| Follow-up response rate | % of follow-up pings answered within 7 days |
| Worsening flag rate | % of follow-ups where patient reported Worse (product health signal) |
| Doctor quality score distribution | Average quality scores across doctors |
| Repeat consultation rate | % of patients who book a second consultation within 90 days |

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Gemini Flash returns poorly structured JSON | Strict JSON-only prompt; try/catch + fallback to raw text display if JSON parse fails |
| AI triage urgency misclassified | Doctor can override urgency on their dashboard; urgency is a routing signal, not a medical decision |
| Gemini mistranslates regional language symptoms | Show original patient text alongside English summary; doctor can ask patient to clarify on call |
| PeerJS connection fails | Fallback to Daily.co free tier; clear "connection failed" error state (not silent blank screen) |
| SSE connection drops mid-wait | Client auto-reconnects with exponential backoff; appointment status persists in DB |
| node-cron follow-up job fails silently | Wrap in try/catch with console logging; add manual trigger route for testing and demo |
| Web Speech API unavailable on device | Detect API availability on mount; gracefully show text input only if unavailable |
| Render cold start delays demo | Ping endpoint pre-warmed before interviews; documented in README |
| Cloudinary upload fails | Retry once; if second attempt fails, store prescription text in DB and show "PDF generation pending" state |
| Voice recognition accuracy in regional languages | Always show transcribed text for confirmation before submission; manual edit always possible |

---

## 13. Future Considerations (Post-v1)

- **Native Android app** — Android dominates the low-cost device market in rural India; a React Native or PWA-to-APK path is the logical next step
- **ASHA / Community Health Worker mode** — Assisted booking where a health worker registers and books on behalf of a patient
- **Offline symptom capture** — Patient fills triage form offline; syncs when connection is restored
- **Pharmacy integration** — Prescription fulfilled directly through a pharmacy partner
- **Payment gateway** — Razorpay integration for consultation fees
- **Expanded language support** — Marathi, Gujarati, Odia, Malayalam based on usage data
- **SMS appointment reminders** — MSG91 or Twilio integration for patients without reliable data
- **Doctor analytics dashboard** — Consultation trends, common diagnoses, quality score history
- **Second opinion flow** — Patient requests second opinion; second doctor sees first doctor's notes and prescription

---

*SwasthConnect PRD v2.0 — July 2026*
*Built to fix what eSanjeevani got wrong.*
