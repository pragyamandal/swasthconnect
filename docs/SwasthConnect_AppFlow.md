# SwasthConnect — Application Flow Document

**SwasthConnect**
Telemedicine Access for Rural & Low-Literacy Communities

---

| Field | Details |
|---|---|
| **Document Owner** | Product Owner |
| **Version** | 1.0 |
| **Status** | Final |
| **Last Updated** | July 2026 |
| **Platform** | Web App — React + Node.js |

---

## Table of Contents

1. Overview
2. User Roles & Entry Points
3. Appointment Status Lifecycle
4. Flow 1 — Landing Page
5. Flow 2 — Registration & Login
6. Flow 3 — Doctor Onboarding (Availability Setup)
7. Flow 4 — Patient Dashboard
8. Flow 5 — Smart Doctor Discovery & Appointment Booking
9. Flow 6 — AI Pre-Consultation Triage
10. Flow 7 — Waiting Room (Real-Time SSE)
11. Flow 8 — Video Consultation
12. Flow 9 — Prescription Generation
13. Flow 10 — Post-Call Summary & Rating
14. Flow 11 — Doctor Dashboard & Queue Management
15. Flow 12 — Patient Health Timeline
16. Flow 13 — Post-Consultation Follow-Up
17. Flow 14 — Doctor Profile & Quality Score
18. Flow 15 — Language Selection & Settings
19. Complete End-to-End Journey (Patient)
20. Complete End-to-End Journey (Doctor)
21. Screen Inventory

---

## 1. Overview

This document describes every screen, transition, decision point, and data flow in SwasthConnect. It is the source of truth for UI implementation and backend API design.

SwasthConnect has two distinct user roles — **Patient** and **Doctor** — with separate dashboards, navigation, and feature access. All flows below specify which role each screen belongs to.

---

## 2. User Roles & Entry Points

```
Unauthenticated User
        │
        ├── /                    Landing Page
        ├── /register/patient    Patient Registration
        ├── /register/doctor     Doctor Registration
        └── /login               Login (both roles)

Authenticated Patient
        └── /patient/*           All patient pages

Authenticated Doctor
        └── /doctor/*            All doctor pages
```

**Route Protection Rules:**
- Any `/patient/*` route accessed without a valid JWT → redirect to `/login`
- Any `/doctor/*` route accessed without a valid JWT → redirect to `/login`
- Patient JWT accessing `/doctor/*` route → redirect to `/patient/dashboard`
- Doctor JWT accessing `/patient/*` route → redirect to `/doctor/dashboard`
- Authenticated user accessing `/login` or `/register` → redirect to their dashboard

---

## 3. Appointment Status Lifecycle

Every appointment moves through a defined set of statuses. This drives UI states, button visibility, and SSE events throughout the app.

```
PENDING
  │
  │  (patient submits triage form)
  ▼
TRIAGED
  │
  │  (patient clicks "Join Waiting Room")
  ▼
WAITING ──────────────────────────────────────────────► EXPIRED
  │                                                  (30 min timeout,
  │  (doctor clicks "Admit Patient")                  no admission)
  ▼
ACTIVE
  │
  │  (either party ends call)
  ▼
CALL_ENDED
  │
  │  (doctor submits prescription)
  ▼
COMPLETED
  │
  │  (3 days later, cron job)
  ▼
FOLLOW_UP_SENT
  │
  │  (patient responds)
  ▼
FOLLOW_UP_COMPLETED

─────────────────────────────────────────────────────────
CANCELLED  (patient cancels from waiting room or before)
```

---

## 4. Flow 1 — Landing Page

**Route:** `/`
**Role:** Unauthenticated

```
User visits SwasthConnect
        │
        ▼
LANDING PAGE
┌─────────────────────────────────────────────────────┐
│  NAVBAR                                             │
│  [SwasthConnect Logo]  How it Works  Features       │
│  For Doctors          [Login]  [Get Started →]      │
├─────────────────────────────────────────────────────┤
│  HERO SECTION                                       │
│  "Quality Healthcare, Wherever You Are"             │
│  Subtext + trust badges                             │
│  [Consult a Doctor]  [Join as Doctor]               │
│  3D illustration: doctor on video call              │
├─────────────────────────────────────────────────────┤
│  STATS BAR                                          │
│  5 Regional Languages | AI Triage | Encrypted Video │
├─────────────────────────────────────────────────────┤
│  HOW IT WORKS                                       │
│  1. Describe Symptoms → 2. AI Recommends Specialist │
│  3. Video Consult → 4. Get Prescription             │
├─────────────────────────────────────────────────────┤
│  FEATURES                                           │
│  AI Triage | Regional Languages | Smart Matching    │
├─────────────────────────────────────────────────────┤
│  FOR DOCTORS                                        │
│  Triage summary before call | Urgency queue |       │
│  Worsening patient alerts                           │
├─────────────────────────────────────────────────────┤
│  FOOTER                                             │
└─────────────────────────────────────────────────────┘
        │
        ├── Click "Consult a Doctor" / "Get Started"
        │         → /register/patient
        │
        ├── Click "Join as Doctor"
        │         → /register/doctor
        │
        └── Click "Login"
                  → /login
```

---

## 5. Flow 2 — Registration & Login

**Route:** `/register/patient`, `/register/doctor`, `/login`
**Role:** Unauthenticated

### 5.1 Patient Registration

```
/register/patient
        │
        ▼
PATIENT REGISTRATION FORM
Fields:
  Full Name | Email | Password | Confirm Password
  Age | Gender | Blood Group
  Preferred Language (EN/HI/KN/TA/TE/BN)
  [Language shown in native script]
        │
        ├── Validation fails
        │         → Show inline field errors
        │         → Stay on form
        │
        └── Validation passes → POST /api/auth/register
                  │
                  ├── Email already exists
                  │         → "Account already exists. Login?"
                  │
                  └── Success
                            → JWT stored in localStorage
                            → i18next language set to selected language
                            → Redirect: /patient/dashboard
```

### 5.2 Doctor Registration

```
/register/doctor
        │
        ▼
DOCTOR REGISTRATION FORM
Fields:
  Full Name | Email | Password | Confirm Password
  Specialisation (searchable dropdown)
  Years of Experience | Medical License Number
  Bio (textarea) | Consultation Fee (₹)
        │
        └── Submit → POST /api/auth/register
                  │
                  └── Success
                            → JWT stored in localStorage
                            → Redirect: /doctor/onboarding
                              (availability setup — first time only)
```

### 5.3 Login

```
/login
        │
        ▼
LOGIN FORM
Fields: Email | Password
[Forgot password link]
        │
        └── Submit → POST /api/auth/login
                  │
                  ├── Invalid credentials
                  │         → "Incorrect email or password"
                  │
                  └── Success
                            → JWT stored in localStorage
                            → GET /api/auth/me → detect role
                            │
                            ├── Role: PATIENT
                            │         → /patient/dashboard
                            │
                            └── Role: DOCTOR
                                      → /doctor/dashboard
```

---

## 6. Flow 3 — Doctor Onboarding (Availability Setup)

**Route:** `/doctor/onboarding`
**Role:** Doctor (first login only)

```
After doctor registration → /doctor/onboarding
        │
        ▼
AVAILABILITY SETUP
Progress indicator: Step 1: Account ✓ | Step 2: Availability ←

For each day (Monday – Saturday):
  [Toggle ON/OFF] [Day Name] [Start Time] [End Time] [+ Add Slot]

Slots appear as removable chips:
  "10:00 AM – 1:00 PM  ✕"

[Save & Continue →]
        │
        └── Submit → PUT /api/doctors/availability
                  │
                  └── Success
                            → Redirect: /doctor/dashboard
                            → Onboarding flag set — won't show again
```

---

## 7. Flow 4 — Patient Dashboard

**Route:** `/patient/dashboard`
**Role:** Patient

```
/patient/dashboard
        │
        ▼
PATIENT DASHBOARD
┌─────────────────────────────────────────────────────┐
│  SIDEBAR                                            │
│  [Avatar] [Name] Patient                            │
│  🏠 Home (active)                                   │
│  🔍 Find a Doctor                                   │
│  📅 My Appointments                                 │
│  📋 Health Timeline                                 │
│  ⚙️  Settings                                       │
│  🌐 Language selector                               │
├─────────────────────────────────────────────────────┤
│  MAIN CONTENT                                       │
│                                                     │
│  "Good morning, [Name] 👋"  [Today's date]          │
│                                                     │
│  ── FOLLOW-UP BANNER (conditional) ──               │
│  "How are you feeling after your consultation       │
│   with Dr. Sharma on [date]?"                       │
│  [😊 Better] [😐 Same] [😟 Worse]                   │
│                                                     │
│  ── UPCOMING APPOINTMENT CARD ──                    │
│  Dr. [Name] | [Specialisation]                      │
│  [Date] [Time] | [Urgency Badge]                    │
│  Triage submitted ✓ / Triage pending ⚠️             │
│  [Join Waiting Room] (active on appointment day)    │
│  OR [Complete Triage →] (if not yet submitted)      │
│                                                     │
│  ── QUICK ACTIONS ──                                │
│  [🔍 Find a Doctor] [📋 Health Timeline]            │
│  [📄 Download Prescriptions]                        │
│                                                     │
│  ── RECENT CONSULTATIONS ──                         │
│  [Doctor] [Date] [Diagnosis] [↓ Download]           │
│  [View All →]                                       │
└─────────────────────────────────────────────────────┘
        │
        ├── Click "Find a Doctor"     → /patient/find-doctor
        ├── Click "Health Timeline"   → /patient/timeline
        ├── Click "Join Waiting Room" → /patient/waiting-room/:appointmentId
        ├── Click "Complete Triage"   → /patient/triage/:appointmentId
        ├── Follow-up response        → POST /api/followup/:id/respond
        └── Click "View All"          → /patient/consultations
```

---

## 8. Flow 5 — Smart Doctor Discovery & Appointment Booking

**Route:** `/patient/find-doctor`, `/patient/doctors/:id`, `/patient/book/:doctorId`
**Role:** Patient

### 8.1 Symptom Input & AI Specialisation Matching

```
/patient/find-doctor
        │
        ▼
FIND A DOCTOR PAGE

"What's bothering you today?"
[Large text input with 🎙️ mic icon]
"Speak in Hindi, Kannada, Tamil, Telugu or Bengali"
[Find My Doctor →]
        │
        ├── Click mic icon
        │         → Web Speech API activates
        │         → Language: user's preferred language
        │         → Transcribed text fills input
        │         → User confirms / edits text
        │
        └── Submit symptoms → POST /api/triage/recommend-specialisation
                  │
                  ▼
          Gemini Flash analyses symptoms
          Returns: recommended specialisation + reason
                  │
                  ▼
          AI RECOMMENDATION BANNER appears:
          "Based on your symptoms, we recommend a: Cardiologist"
          "Not what you're looking for? Browse all ↓"
                  │
                  ▼
          DOCTOR LIST (filtered by recommended specialisation)
          [Filters: Specialisation | Experience | Sort by Quality]

          Each Doctor Card:
          Avatar | Name ✓ | Specialisation tag
          ★ Quality Score (X.X) | (N consultations)
          Experience | Next slot | ₹ Fee
          [Book Consultation →]
```

### 8.2 Doctor Profile

```
Click doctor card / "Book Consultation"
        │
        ▼
/patient/doctors/:id

DOCTOR PROFILE PAGE
  Header: Avatar | Name | Verified ✓ | Specialisation
  Quality Score breakdown:
    ★ X.X overall | (N consultations)
    Clarity of Explanation  ████░ X.X
    Time Given              ████░ X.X
    Prescription Quality    █████ X.X
    Overall                 ████░ X.X

  About: Bio | Experience | Languages spoken

  Availability:
  [Mon] [Tue] [Wed] [Thu] [Fri] [Sat]
  Selected day → time slot chips
  [10:00 AM] [11:00 AM] [2:00 PM] ...

  ₹ [Fee] per consultation

  [Book & Continue to Triage →] (sticky bottom, mobile)
        │
        └── Select slot + Click Book
                  │
                  └── POST /api/appointments
                            │
                            └── Success
                                      → Appointment created (PENDING)
                                      → Redirect: /patient/triage/:appointmentId
```

---

## 9. Flow 6 — AI Pre-Consultation Triage

**Route:** `/patient/triage/:appointmentId`
**Role:** Patient

```
/patient/triage/:appointmentId
        │
        ▼
AI TRIAGE FORM

Progress: Book Doctor ✓ | Health Info ← | Consult | Prescription

Doctor info strip: [Avatar] Dr. [Name] | [Date] [Time]

FORM FIELDS:
─────────────────────────────────────────────────────
1. Primary Symptoms *
   [Textarea with 🎙️ mic icon top-right]
   Placeholder: "Describe in your words or speak..."
   Language pills: [EN] [हि] [ಕ] [த] [తె] [বা]

   Click mic:
     → Web Speech API activates in selected language
     → "Listening..." indicator shown
     → Transcribed text appears in field
     → User can edit before moving on

2. How long have you had these symptoms? *
   Pill selector:
   [1-2 days] [3-5 days] [1 week] [More than a week]

3. Severity *
   Slider: Mild ───●─── Severe
   (Blue track, orange thumb, label updates)

4. Existing Medical Conditions
   Multi-select chips:
   [Diabetes] [Hypertension] [Heart Disease]
   [Asthma] [None] [+ Add Custom]

5. Current Medications (optional)
   [Text input] "e.g. Metformin 500mg"

6. Any recent changes?
   Multi-select chips:
   [Travelled recently] [Change in diet]
   [High stress] [None]
─────────────────────────────────────────────────────
[Generate My Health Summary →]
"🔒 This summary is only shared with your doctor"
        │
        ├── Validation fails (required fields empty)
        │         → Highlight empty fields
        │
        └── Submit → POST /api/triage
                  │
                  ▼
          Backend sends to Gemini Flash:
          {
            symptoms, duration, severity,
            conditions, medications,
            changes, language
          }
                  │
                  ▼
          Gemini returns JSON:
          {
            chief_complaint,
            duration,
            severity,
            relevant_history,
            current_medications,
            urgency: ROUTINE|PRIORITY|EMERGENCY,
            summary
          }
                  │
                  ▼
          Stored in triage_summaries table
          Appointment status → TRIAGED
                  │
                  ▼
          SUCCESS STATE shown to patient:
          ┌────────────────────────────────┐
          │ ✓ Your health summary has been │
          │   sent to Dr. [Name]           │
          │                                │
          │ Urgency: [PRIORITY badge]      │
          │                                │
          │ What your doctor will see:     │
          │ Chief complaint: [text]        │
          │ Duration: [text]               │
          │ Summary: [AI summary text]     │
          │                                │
          │ [Go to Dashboard]              │
          │ (Join Waiting Room on day of   │
          │  appointment)                  │
          └────────────────────────────────┘
```

---

## 10. Flow 7 — Waiting Room (Real-Time SSE)

**Route:** `/patient/waiting-room/:appointmentId`
**Role:** Patient

```
Patient clicks "Join Waiting Room" on dashboard
(button active only on appointment day)
        │
        ▼
/patient/waiting-room/:appointmentId

GET /api/waiting-room/stream → SSE connection opens
Appointment status → WAITING
SSE event fired to doctor dashboard: "Patient [Name] is waiting"
        │
        ▼
WAITING ROOM SCREEN (distraction-free, no sidebar)

┌────────────────────────────────────────────┐
│          [SwasthConnect Logo]              │
│                                            │
│    ◉ (pulsing blue circle animation)       │
│                                            │
│  "Waiting for Dr. Sharma to admit you..."  │
│                                            │
│  "Please keep this tab open."              │
│                                            │
│  [Doctor Avatar] Dr. Sharma | Cardiologist │
│  Scheduled: 3:00 PM Today                  │
│                                            │
│  🟢 Doctor is online                       │
│  ─────────────────────────────────────     │
│  What your doctor will see:                │
│  Chief Complaint: Chest pain               │
│  Duration: 2 days                          │
│  Severity: Moderate                        │
│  Urgency: [PRIORITY]                       │
│  Full summary sent to Dr. Sharma ✓         │
│  ─────────────────────────────────────     │
│  Having trouble? Refresh the page          │
│  Cancel appointment                        │
└────────────────────────────────────────────┘

SSE EVENTS HANDLED:
        │
        ├── event: "admitted"
        │         → Auto-redirect: /patient/call/:appointmentId
        │
        ├── event: "doctor_offline"
        │         → "Doctor appears to be offline. 
        │            Please wait or reschedule."
        │
        └── SSE connection drops
                  → Auto-reconnect with exponential backoff
                  → If reconnect fails after 3 attempts:
                    "Connection lost. Refreshing..."
                    → Auto page refresh

TIMEOUT HANDLING:
        │
        └── 30 minutes pass with no admission
                  → Cron check sets status → EXPIRED
                  → SSE event: "expired"
                  → "Your waiting time has expired.
                     Please reschedule your appointment."
                  → Redirect: /patient/dashboard

CANCEL:
        │
        └── Patient clicks "Cancel appointment"
                  → Confirm modal: "Are you sure?"
                  → PATCH /api/appointments/:id/status → CANCELLED
                  → Redirect: /patient/dashboard
```

---

## 11. Flow 8 — Video Consultation

**Route:** `/patient/call/:appointmentId`, `/doctor/call/:appointmentId`
**Role:** Both (same route, different layout)

```
PATIENT SIDE:
Auto-redirected from waiting room after SSE "admitted" event

DOCTOR SIDE:
Clicks "Admit Patient" on dashboard
→ PATCH /api/appointments/:id/status → ACTIVE
→ Redirected to /doctor/call/:appointmentId
        │
        ▼
Both browsers load /call/:appointmentId
        │
        ▼
GET /api/room/:appointmentId
→ Returns PeerJS peer IDs for both parties
        │
        ▼
PeerJS connects both to self-hosted PeerServer
Using appointmentId as room identifier
Doctor = caller | Patient = callee
        │
        ▼
VIDEO CALL ROOM (full screen, dark mode)

┌─────────────────────────────────────────────────────┐
│  [SwasthConnect ◼] "Consultation with Dr. Sharma"  │
│  🔴 Live  |  00:04:32  |  Signal: ▮▮▮▮            │
├──────────────────────────┬──────────────────────────┤
│                          │  TRIAGE SUMMARY PANEL    │
│   MAIN VIDEO FEED        │  (doctor side only)      │
│   (doctor's camera)      │  ─────────────────────   │
│                          │  Chief Complaint:        │
│                          │  Chest pain              │
│                          │  Duration: 2 days        │
│                          │  Severity: Moderate      │
│                          │  Urgency: [PRIORITY]     │
│                          │  Conditions:             │
│                          │  Hypertension            │
│                          │  Medications:            │
│          ┌──────────┐    │  Amlodipine 5mg          │
│          │ Patient  │    │  ─────────────────────   │
│          │ PiP feed │    │  AI Summary:             │
│          └──────────┘    │  "45yr hypertensive..."  │
│                          │  ─────────────────────   │
│                          │  Consultation Notes:     │
│                          │  [textarea]              │
├──────────────────────────┴──────────────────────────┤
│         [🎙️ Mute] [📹 Video] [🔊 Speaker]           │
│                    [📞 End Call]                    │
└─────────────────────────────────────────────────────┘

AUDIO-ONLY FALLBACK:
        │
        └── Video quality degrades repeatedly
                  → PeerJS detects poor connection
                  → Auto-switch to audio-only
                  → Yellow banner:
                    "⚠️ Video weak — switched to audio only.
                     Call is still active."
                  → Patient can manually toggle video/audio

END CALL:
        │
        └── Either party clicks End Call
                  → Confirm: "End consultation?"
                  → PeerJS connection closed
                  → Appointment status → CALL_ENDED
                  │
                  ├── Patient → /patient/post-call/:appointmentId
                  └── Doctor → /doctor/prescription/:appointmentId
```

---

## 12. Flow 9 — Prescription Generation

**Route:** `/doctor/prescription/:appointmentId`
**Role:** Doctor

```
/doctor/prescription/:appointmentId
        │
        ▼
PRESCRIPTION FORM

Progress: Consult ✓ | Prescription ←

Patient info strip:
[Avatar] [Name, Age, Gender] | Consulted: [Date Time] | [Urgency badge]

FORM:
─────────────────────────────────────────────────────
1. Diagnosis *
   [Text input] "Enter primary diagnosis"

2. Medicines (repeatable)
   Each medicine row (white card):
   [Medicine Name] [Dosage] [Frequency ▾] [Duration] [Instructions]
   [+ Add Another Medicine]

3. Doctor's Notes
   [Textarea] "Additional observations or advice..."

4. Follow-up Required?
   Toggle: [No] / [Yes]
   If Yes → Date picker: "Schedule follow-up on:"

5. Refer to Specialist?
   Toggle: [No] / [Yes]
   If Yes → Specialisation dropdown + Reason field
─────────────────────────────────────────────────────
[Generate & Send Prescription →]
"📄 A PDF will be generated and sent to patient's dashboard"
        │
        └── Submit → POST /api/consultations
                  │
                  ▼
          Backend:
          1. Save consultation record (diagnosis, notes, follow-up)
          2. pdfkit generates prescription PDF
          3. PDF uploaded to Cloudinary
          4. Cloudinary URL stored in consultations table
          5. Appointment status → COMPLETED
                  │
                  ▼
          SUCCESS STATE:
          "✓ Prescription sent to [Patient Name]"
          [View Patient History] [Back to Dashboard]
                  │
                  └── Redirect: /doctor/dashboard
```

---

## 13. Flow 10 — Post-Call Summary & Rating

**Route:** `/patient/post-call/:appointmentId`
**Role:** Patient

```
Patient auto-redirected here after call ends
        │
        ▼
/patient/post-call/:appointmentId

POST-CALL SCREEN
┌────────────────────────────────────────────┐
│  ✅ (green check animation)                │
│  "Consultation Complete! 🎉"               │
│  "Your prescription is ready"              │
│                                            │
│  ── CONSULTATION SUMMARY ──                │
│  Doctor: Dr. Sharma, Cardiologist          │
│  Date: [Date] [Start] – [End]              │
│  Duration: [N] minutes                     │
│  Diagnosis: [text]                         │
│                                            │
│  ── PRESCRIPTION ──                        │
│  "📄 Your prescription has been generated" │
│  [Download Prescription PDF]               │
│  "Added to your Health Timeline ✓"         │
│                                            │
│  ── RATE YOUR CONSULTATION ──              │
│  "How was your experience?"                │
│  🗣️ Clarity of Explanation  ★★★★★          │
│  ⏱️ Time Given              ★★★★★          │
│  💊 Prescription Quality    ★★★★★          │
│  ⭐ Overall Experience       ★★★★★          │
│                                            │
│  [Submit Rating]   [Skip for now]          │
│                                            │
│  ── FOLLOW-UP (if doctor set one) ──       │
│  "Dr. Sharma suggested a follow-up         │
│   on [Date]"                               │
│  [Add to Calendar]                         │
│                                            │
│  [Go to Dashboard →]                       │
└────────────────────────────────────────────┘
        │
        ├── Click "Download Prescription PDF"
        │         → GET /api/prescriptions/:id
        │         → Opens Cloudinary PDF URL in new tab
        │
        ├── Submit Rating
        │         → POST /api/ratings
        │         → Doctor quality score recalculated
        │         → "Thank you for your feedback ✓"
        │
        └── Click "Go to Dashboard"
                  → /patient/dashboard
```

---

## 14. Flow 11 — Doctor Dashboard & Queue Management

**Route:** `/doctor/dashboard`
**Role:** Doctor

```
/doctor/dashboard
        │
        ▼
DOCTOR DASHBOARD
┌─────────────────────────────────────────────────────┐
│  SIDEBAR                                            │
│  [Avatar] Dr. [Name] | [Specialisation] ✓           │
│  🏠 Dashboard (active)                              │
│  👥 Today's Queue                                   │
│  📅 Appointments                                    │
│  👤 My Profile                                      │
│  ⚙️  Settings                                       │
├─────────────────────────────────────────────────────┤
│  MAIN CONTENT                                       │
│                                                     │
│  "Good morning, Dr. [Name] 👋"                      │
│  "You have [N] consultations today"                 │
│                                                     │
│  ── FLAGGED ALERT (conditional, red banner) ──      │
│  ⚠️ "Patient [Name] reported worsening symptoms     │
│      after your consultation on [date]"             │
│  Chief complaint: [text from triage]               │
│  [View Patient →]                                   │
│                                                     │
│  ── TODAY'S QUEUE ──                                │
│  [Date]  [N patients]  Sorted by urgency ↓          │
│                                                     │
│  🔴 EMERGENCY — [Name], [Age][Gender]               │
│  "[Chief complaint preview]"                        │
│  Scheduled: [Time] | Status: WAITING 🟢             │
│  [Admit Patient ▶] [View Triage]                    │
│                                                     │
│  🟠 PRIORITY — [Name], [Age][Gender]                │
│  "[Chief complaint preview]"                        │
│  Scheduled: [Time] | Status: SCHEDULED              │
│  [Admit Patient — greyed] [View Triage]             │
│                                                     │
│  🔵 ROUTINE — [Name], [Age][Gender]                 │
│  "[Chief complaint preview]"                        │
│  Scheduled: [Time] | Status: SCHEDULED              │
│  [Admit Patient — greyed] [View Triage]             │
│                                                     │
│  ── QUICK STATS ──                                  │
│  Total Consultations: [N] | ★ [Score] | This Week: [N]│
└─────────────────────────────────────────────────────┘

SSE SUBSCRIPTION (doctor dashboard):
        │
        └── GET /api/waiting-room/stream (doctor channel)
                  │
                  ├── event: "patient_waiting"
                  │         → Patient card status → WAITING 🟢
                  │         → "Admit Patient" button activates
                  │         → Notification bell increments
                  │
                  └── event: "patient_cancelled"
                            → Patient card status → CANCELLED
                            → "Admit Patient" button deactivates

ADMIT PATIENT:
        │
        └── Doctor clicks "Admit Patient"
                  → PATCH /api/appointments/:id/status → ACTIVE
                  → SSE fires to patient: "admitted"
                  → Doctor redirected: /doctor/call/:appointmentId

VIEW TRIAGE:
        │
        └── Doctor clicks "View Triage"
                  → Slide-in panel or modal
                  → Full triage summary displayed:
                    Chief complaint | Duration | Severity
                    Urgency badge | Conditions | Medications
                    AI Summary paragraph
                    Original patient text (in their language)
```

---

## 15. Flow 12 — Patient Health Timeline

**Route:** `/patient/timeline`
**Role:** Patient

```
/patient/timeline
        │
        ▼
PATIENT HEALTH TIMELINE

"My Health Timeline"
"Your complete consultation history in one place"

FILTERS:
[Date Range ▾] [Specialisation ▾] [Search doctor name]

TIMELINE (vertical, left timeline line):
        │
        ├── [15 Nov 2024] ──●──────────────────────────
        │                   │
        │                   ▼ CONSULTATION CARD (expanded)
        │                   Dr. Sharma | Cardiologist | [PRIORITY]
        │                   ─────────────────────────────────────
        │                   Your symptoms: "Chest pain..."
        │                   Duration: 2 days | Severity: Moderate
        │                   [Original: ಎದೆ ನೋವು ...]  ← if non-EN
        │                   ─────────────────────────────────────
        │                   Diagnosis: Hypertensive episode
        │                   Doctor's notes: "Monitor BP..."
        │                   ─────────────────────────────────────
        │                   📄 Prescription — 15 Nov 2024
        │                   [Download PDF]
        │                   ─────────────────────────────────────
        │                   Follow-up: 22 Nov 2024
        │                   Your response: 😊 Better (18 Nov)
        │                   ─────────────────────────────────────
        │                   Your rating: ★★★★☆ 4/5
        │
        ├── [3 Aug 2024] ───●────────────────────────────
        │                   │
        │                   ▼ CONSULTATION CARD (collapsed)
        │                   Dr. Patel | General Physician | [ROUTINE]
        │                   [Click to expand ▾]
        │
        └── [Load More]

Click collapsed card → expands to show full details
        │
        └── GET /api/consultations/my
                  → Paginated, newest first
```

---

## 16. Flow 13 — Post-Consultation Follow-Up

**Route:** Triggered on Patient Dashboard
**Role:** Patient (banner) + Doctor (flag)

### 16.1 Cron Job (Backend — nightly 8:00 PM)

```
node-cron fires at 8:00 PM daily
        │
        ▼
Query: appointments WHERE
  status = COMPLETED
  AND completed_at = TODAY - 3 days
  AND no follow_up_request exists
        │
        ▼
For each qualifying appointment:
  INSERT INTO follow_up_requests
  (appointment_id, sent_at, response: null,
   doctor_flagged: false)
        │
        ▼
follow_up_requests row created
```

### 16.2 Patient Sees Follow-Up Banner

```
Patient logs into dashboard
        │
        ▼
GET /api/followup/pending
→ Returns pending follow-up requests
        │
        ├── No pending follow-ups
        │         → Dashboard shows normally
        │
        └── Pending follow-up exists
                  → FOLLOW-UP BANNER shown (orange):
                    "How are you feeling after your
                     consultation with Dr. [Name] on [date]?"
                    [😊 Better] [😐 Same] [😟 Worse]
```

### 16.3 Patient Responds

```
Patient clicks a response
        │
        └── POST /api/followup/:id/respond
            { response: "BETTER" | "SAME" | "WORSE" }
                  │
                  ├── BETTER
                  │         → Banner replaced:
                  │           "Great! Stay healthy. 🌟"
                  │         → follow_up: response=BETTER,
                  │           status=COMPLETED
                  │
                  ├── SAME
                  │         → Banner replaced:
                  │           "Consider booking a follow-up
                  │            if symptoms persist."
                  │           [Book Follow-Up Consultation →]
                  │         → follow_up: response=SAME,
                  │           status=COMPLETED
                  │
                  └── WORSE
                            → Banner replaced:
                              "We've notified your doctor.
                               Book an urgent consultation or
                               visit a hospital if it's an emergency."
                              [Book Urgent Consultation →]
                            → follow_up: response=WORSE,
                              doctor_flagged=true,
                              status=COMPLETED
```

### 16.4 Doctor Sees Flag

```
Doctor logs into dashboard
        │
        ▼
GET /api/followup/flags
→ Returns unflagged worsening responses
        │
        └── Flagged follow-ups exist
                  → RED ALERT BANNER on dashboard:
                    ⚠️ "Patient [Name] reported worsening
                        symptoms after your consultation
                        on [date]."
                    Chief complaint: [from triage summary]
                    [View Patient History →]
                    → seen_by_doctor → true (banner dismisses)
```

---

## 17. Flow 14 — Doctor Profile & Quality Score

**Route:** `/doctor/profile` (own), `/patient/doctors/:id` (public view)
**Role:** Doctor (own), Patient (public view)

```
DOCTOR'S OWN PROFILE (/doctor/profile):
        │
        ▼
PROFILE PAGE
  Header: [Avatar] Dr. [Name] | Verified ✓ | [Specialisation]
  "8 years experience" | "₹ 300 per consultation"

  QUALITY SCORE:
  Overall: ★ 4.2 | (124 consultations)
  Clarity of Explanation  ████████░░  4.3
  Time Given              ███████░░░  4.1
  Prescription Quality    ██████████  4.6
  Overall Experience      ████████░░  4.2

  ABOUT:
  Bio | Specialisations | Languages spoken

  AVAILABILITY:
  Week grid — teal chips for available slots
  [Edit Availability →]

  STATS:
  Total: 248 | This Week: 12 | Completed: 98%

  [Edit Profile]

PATIENT VIEW (/patient/doctors/:id):
  Same layout but:
  No edit buttons
  [Book a Consultation →] (sticky bottom, mobile)
```

---

## 18. Flow 15 — Language Selection & Settings

**Route:** `/patient/settings`, first-launch modal
**Role:** Patient

### 18.1 First Launch Language Selection

```
New user opens app for first time
        │
        ▼
LANGUAGE SELECTION SCREEN (mandatory, no skip)

"Choose Your Language / अपनी भाषा चुनें"

[🇬🇧 English]
[हिन्दी Hindi]
[ಕನ್ನಡ Kannada]
[தமிழ் Tamil]
[తెలుగు Telugu]
[বাংলা Bengali]

(Each label in its own script)
        │
        └── Click any language
                  → i18next loads that language
                  → Web Speech API locale set
                  → Stored in localStorage
                  → Proceed to Register / Login
```

### 18.2 Language Change in Settings

```
/patient/settings → Language section
        │
        ▼
Current language shown with checkmark ✓
All 6 options listed
        │
        └── Click new language
                  → i18n.changeLanguage() called
                  → UI re-renders instantly in new language
                  → Web Speech API locale updated
                  → PATCH /api/users/language
                  → Saved to users.preferred_language in DB
                  → Saved to localStorage
```

---

## 19. Complete End-to-End Journey (Patient)

```
New User                           Returning User
    │                                   │
    ▼                                   ▼
Language Selection            Login → Dashboard
    │
    ▼
Register (select language)
    │
    ▼
Patient Dashboard
    │
    ▼
Find a Doctor
  → Type/speak symptoms
  → AI recommends specialisation
  → Browse filtered doctor list
  → View doctor profile + quality score
  → Select time slot
  → Book appointment
    │
    ▼
AI Triage Form
  → Fill symptoms (voice/text, own language)
  → Select duration, severity, conditions
  → Submit → Gemini generates summary + urgency
    │
    ▼
[Wait until appointment day]
    │
    ▼
Join Waiting Room
  → SSE connection opens
  → See triage summary preview
  → Wait for doctor to admit
    │
    ▼
[Doctor clicks Admit →]
SSE event received
Auto-redirect to Video Call
    │
    ▼
Video Consultation
  → Doctor has triage summary visible
  → WebRTC P2P video (or audio fallback)
  → [Doctor ends call]
    │
    ▼
Post-Call Summary
  → View consultation summary
  → Download prescription PDF
  → Rate consultation (4 dimensions)
    │
    ▼
[3 days later]
    │
    ▼
Follow-Up Banner on Dashboard
  → Better / Same / Worse
  → If Worse: Doctor flagged
    │
    ▼
Health Timeline Updated
  → Full consultation entry visible
  → Triage + Diagnosis + Prescription + Rating
    + Follow-up response
```

---

## 20. Complete End-to-End Journey (Doctor)

```
New Doctor                         Returning Doctor
    │                                   │
    ▼                                   ▼
Register                          Login → Dashboard
    │
    ▼
Onboarding: Set Availability
(days, time slots)
    │
    ▼
Doctor Dashboard
  → See today's queue (sorted: EMERGENCY → PRIORITY → ROUTINE)
  → Check ⚠️ worsening patient flags
    │
    ▼
Patient appears as WAITING in queue
(SSE event received)
"Admit Patient" button activates
    │
    ▼
Click "View Triage" (optional pre-call review)
  → See full AI clinical summary
  → Chief complaint, urgency, conditions, medications
    │
    ▼
Click "Admit Patient"
  → SSE fires to patient
  → Both redirected to Video Call
    │
    ▼
Video Consultation
  → Triage summary visible in right panel throughout call
  → Write consultation notes during call
    │
    ▼
End Call
  → Redirected to Prescription Form
  → Fill: Diagnosis, medicines, notes, follow-up date
  → Submit → PDF generated → Patient notified
    │
    ▼
[3 days later]
    │
    ▼
Check dashboard for ⚠️ flags
  → If patient reported Worse:
    Alert shown with patient name + original complaint
    [View Patient History]
```

---

## 21. Screen Inventory

| # | Screen | Route | Role |
|---|---|---|---|
| 1 | Landing Page | `/` | Public |
| 2 | Patient Registration | `/register/patient` | Public |
| 3 | Doctor Registration | `/register/doctor` | Public |
| 4 | Login | `/login` | Public |
| 5 | Doctor Availability Setup | `/doctor/onboarding` | Doctor |
| 6 | Patient Dashboard | `/patient/dashboard` | Patient |
| 7 | Find a Doctor | `/patient/find-doctor` | Patient |
| 8 | Doctor Profile (Patient View) | `/patient/doctors/:id` | Patient |
| 9 | AI Triage Form | `/patient/triage/:appointmentId` | Patient |
| 10 | Waiting Room | `/patient/waiting-room/:appointmentId` | Patient |
| 11 | Video Call (Patient) | `/patient/call/:appointmentId` | Patient |
| 12 | Post-Call Summary & Rating | `/patient/post-call/:appointmentId` | Patient |
| 13 | Patient Health Timeline | `/patient/timeline` | Patient |
| 14 | Patient Settings | `/patient/settings` | Patient |
| 15 | Doctor Dashboard | `/doctor/dashboard` | Doctor |
| 16 | Video Call (Doctor) | `/doctor/call/:appointmentId` | Doctor |
| 17 | Prescription Form | `/doctor/prescription/:appointmentId` | Doctor |
| 18 | Doctor Profile (Own) | `/doctor/profile` | Doctor |

**Total screens: 18**
**Patient screens: 9**
**Doctor screens: 5**
**Shared screens: 2 (Video Call — same route, different layout)**
**Public screens: 4**

---

*SwasthConnect App Flow v1.0 — July 2026*
*Every screen. Every transition. Every decision point.*
