# SwasthConnect — Technical Requirements Document

**SwasthConnect**
Telemedicine Access for Rural & Low-Literacy Communities

---

| Field | Details |
|---|---|
| **Document Owner** | Engineering Lead |
| **Version** | 2.0 (Corrected) |
| **Status** | Final |
| **Last Updated** | July 2026 |
| **Platform** | Web App — React + Node.js |

---

## Table of Contents

1. System Overview
2. Architecture Diagram
3. Technology Stack
4. Functional Technical Specifications
   - 4.1 Auth & Role-Based Access
   - 4.2 Regional Language Support (i18next)
   - 4.3 Voice Input (Web Speech API)
   - 4.4 Smart Doctor Discovery
   - 4.5 Appointment Booking
   - 4.6 AI Pre-Consultation Triage (Gemini Flash)
   - 4.7 Real-Time Waiting Room (SSE)
   - 4.8 Video Consultation (PeerJS WebRTC)
   - 4.9 Prescription Generation (pdfkit + Cloudinary)
   - 4.10 Patient Health Timeline
   - 4.11 Post-Consultation Rating
   - 4.12 Post-Consultation Follow-Up (node-cron)
5. Non-Functional Requirements
6. Security
7. Third-Party Dependencies
8. Deployment Architecture
9. Open Questions & Decisions Log

---

## 1. System Overview

SwasthConnect is a full-stack telemedicine web application with two user roles — Patient and Doctor. The system enables rural patients to book appointments, complete an AI-generated pre-consultation triage, join a real-time waiting room, conduct a WebRTC video consultation, and receive a downloadable prescription — all in their preferred regional language.

The backend is a REST API with one real-time SSE endpoint and one self-hosted PeerJS signalling server. There is no Redis, no SFU media server, no SMS gateway, and no message queue. The architecture is intentionally minimal — every technical decision is made for a 1:1 patient-to-doctor call with a portfolio-scale user base.

---

## 2. Architecture Diagram

```
VERCEL (React Frontend)
│
├── Patient pages (/patient/*)
│   ├── Dashboard
│   ├── Find a Doctor (Symptom → Specialisation AI)
│   ├── Doctor Profile (public view)
│   ├── AI Triage Form (voice + text, multilingual)
│   ├── Waiting Room (SSE client)
│   ├── Video Call Room (PeerJS client)
│   ├── Post-Call Summary + Rating
│   ├── Health Timeline
│   └── Settings (language)
│
└── Doctor pages (/doctor/*)
    ├── Onboarding (availability setup)
    ├── Dashboard + Queue (SSE client)
    ├── Video Call Room (PeerJS client)
    ├── Prescription Form
    └── Profile / Availability
         │
         │ HTTPS REST (Axios + JWT Bearer header)
         │ SSE stream (EventSource)
         │ PeerJS WebRTC signalling
         ▼
RENDER (Node.js + Express Backend)
│
├── /api/auth                  JWT auth, registration, login
├── /api/doctors               Listing, profiles, availability
├── /api/appointments          Booking, queue, status management
├── /api/triage                Gemini Flash integration
├── /api/consultations         Notes, prescription generation
├── /api/ratings               Quality score system
├── /api/followup              Follow-up responses, doctor flags
├── /api/waiting-room/stream   SSE endpoint
├── /peerjs                    Self-hosted PeerServer
│
├── SERVICES
│   ├── gemini.service.js      Triage + specialisation AI prompts
│   ├── cloudinary.service.js  PDF upload + URL retrieval
│   ├── pdf.service.js         pdfkit prescription generation
│   └── cron.service.js        node-cron follow-up job
│
└── NEON PostgreSQL (via Prisma ORM)
    ├── users
    ├── doctor_profiles
    ├── availability_slots
    ├── appointments
    ├── triage_summaries
    ├── consultations
    ├── ratings
    └── follow_up_requests
```

**What this architecture does NOT include (and why):**

| Excluded | Reason |
|---|---|
| Redis | No caching requirements at portfolio scale; session managed via JWT; no rate limiting infrastructure needed |
| SFU / mediasoup / Twilio Video | SwasthConnect calls are always 1 patient ↔ 1 doctor; P2P WebRTC via PeerJS is sufficient and free |
| SMS gateway (MSG91 / Twilio) | All notifications are in-app; SMS is a future consideration post-v1 |
| Message queue (RabbitMQ / BullMQ) | No async job pipeline needed; node-cron covers the only background job |
| PWA / Service Worker | Low-connectivity optimisation is post-v1; adds Workbox complexity without clear v1 benefit |

---

## 3. Technology Stack

### 3.1 Frontend

| Layer | Technology | Justification |
|---|---|---|
| Framework | React 18 + Vite | Fast build, HMR, standard for SDE interviews |
| Language | TypeScript | Type safety across API responses and component props |
| Styling | Tailwind CSS | Rapid UI development; no CSS file sprawl |
| Routing | React Router v6 | Nested routes, protected route wrappers |
| State | React Context + useReducer | Sufficient for portfolio scale; no Redux overhead |
| API client | Axios | Interceptors for JWT header injection; cleaner than fetch |
| Real-time | EventSource (native browser) | Built-in SSE client; no library needed |
| WebRTC | PeerJS client library | Abstracts ICE/SDP; works out of the box for P2P |
| Internationalisation | i18next + react-i18next | Industry standard; lazy-loads language JSON files |
| Voice input | Web Speech API (native browser) | Free; no external service; supports all 6 languages |
| PDF download | Cloudinary URL (browser fetch) | PDF generated server-side; client only downloads |

### 3.2 Backend

| Layer | Technology | Justification |
|---|---|---|
| Runtime | Node.js 20 LTS | Async I/O fits SSE + WebRTC signalling model |
| Framework | Express.js | Lightweight, well-understood, interview-standard |
| Language | TypeScript | Shared types with frontend via shared/ package |
| ORM | Prisma | Type-safe DB queries; migration management; Neon-compatible |
| Auth | JWT (jsonwebtoken) | Stateless; no session store needed |
| Password hashing | bcrypt | Industry standard |
| Real-time | SSE (native Node.js res.write) | Simpler than WebSocket for unidirectional server→client push |
| WebRTC signalling | PeerJS Server (self-hosted on Render) | Free; routes are /peerjs; handles ICE negotiation |
| AI | Google Gemini Flash API | Fast inference; cheap; handles multilingual input natively |
| PDF generation | pdfkit | Server-side PDF creation; no headless browser needed |
| File storage | Cloudinary | Free tier sufficient; returns permanent URL for prescription |
| Background jobs | node-cron | Lightweight cron for nightly follow-up job |
| Validation | Zod | Schema-based input validation; pairs well with TypeScript |

### 3.3 Database & Deployment

| Layer | Technology | Justification |
|---|---|---|
| Database | Neon PostgreSQL | Serverless Postgres; free tier; Prisma-compatible |
| Frontend deploy | Vercel | Free tier; zero-config React/Vite deployment |
| Backend deploy | Render | Free tier Node.js hosting; supports persistent SSE connections |
| Media/files | Cloudinary | Free tier; 25GB storage; CDN delivery |

---

## 4. Functional Technical Specifications

### 4.1 Auth & Role-Based Access

**Registration flow:**

```
POST /api/auth/register
Body: { name, email, password, role: 'PATIENT'|'DOCTOR', ...roleFields }

Server:
  1. Validate with Zod schema
  2. Check email uniqueness (SELECT WHERE email = ?)
  3. bcrypt.hash(password, 12)
  4. INSERT into users
  5. If DOCTOR: INSERT into doctor_profiles
  6. Return JWT (signed with JWT_SECRET, expires 7d)
  7. Return user object (id, name, role, preferred_language)
```

**Login flow:**

```
POST /api/auth/login
Body: { email, password }

Server:
  1. SELECT user WHERE email = ?
  2. bcrypt.compare(password, stored_hash)
  3. If match: return JWT + user object
  4. If no match: 401 { error: 'Invalid credentials' }
```

**JWT middleware (applied to all /api/* routes except /auth/*):**

```typescript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorised' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalid or expired' });
  }
};
```

**Role guard middleware:**

```typescript
const requireRole = (role: 'PATIENT' | 'DOCTOR') =>
  (req, res, next) => {
    if (req.user.role !== role)
      return res.status(403).json({ error: 'Forbidden' });
    next();
  };
```

**Frontend route protection:**
- `<ProtectedRoute role="PATIENT">` — checks JWT in localStorage + decoded role
- `<ProtectedRoute role="DOCTOR">` — same
- Redirects: unauthenticated → `/login`; wrong role → own dashboard

---

### 4.2 Regional Language Support (i18next)

**Supported languages:**

| Code | Language | Script | BCP-47 |
|---|---|---|---|
| EN | English | Latin | en |
| HI | Hindi | Devanagari | hi |
| KN | Kannada | Kannada | kn |
| TA | Tamil | Tamil | ta |
| TE | Telugu | Telugu | te |
| BN | Bengali | Bengali | bn |

**i18next configuration:**

```typescript
// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem('swasth_lang') || 'en',
    fallbackLng: 'en',
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    interpolation: { escapeValue: false },
  });
```

**File structure:**

```
/public/locales/
  en/translation.json
  hi/translation.json
  kn/translation.json
  ta/translation.json
  te/translation.json
  bn/translation.json
```

**Every UI string uses the `t()` hook — no hardcoded English strings in components:**

```tsx
const { t } = useTranslation();
<button>{t('book_appointment')}</button>
```

**Language persistence:**
1. Selected at first launch (mandatory modal) → stored in `localStorage` as `swasth_lang`
2. On registration, `preferred_language` saved to `users` table via `POST /api/auth/register`
3. On login, `GET /api/auth/me` returns `preferred_language` → i18next syncs
4. Language change in Settings → `i18n.changeLanguage()` + `PATCH /api/users/language` + `localStorage` update

**Doctor side:** Always English. No i18next wrapping needed on doctor-facing components. Triage summaries are always generated in English by Gemini regardless of patient's input language.

**ESLint rule (enforced in CI):**
```json
"i18next/no-literal-string": "error"
```
Prevents any literal string from entering JSX without being wrapped in `t()`.

---

### 4.3 Voice Input (Web Speech API)

**Availability detection (on component mount):**

```typescript
const isSpeechAvailable = 'webkitSpeechRecognition' in window
  || 'SpeechRecognition' in window;
```

If unavailable: mic button hidden, text input shown only. No error thrown.

**Language mapping (BCP-47 locale codes):**

```typescript
const speechLocaleMap: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
};
```

**Recognition configuration:**

```typescript
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = speechLocaleMap[currentLanguage];
recognition.continuous = false;
recognition.interimResults = true;  // shows live transcription as user speaks

recognition.onresult = (event) => {
  const transcript = Array.from(event.results)
    .map(r => r[0].transcript)
    .join('');
  setSymptomsText(transcript);  // populates the triage textarea
};

recognition.onerror = (event) => {
  if (event.error === 'no-speech') showToast(t('voice_no_speech'));
  if (event.error === 'not-allowed') showToast(t('voice_permission_denied'));
};
```

**Critical rule:** Voice recognition result is NEVER auto-submitted. Patient always sees the transcribed text, can edit it, and manually clicks Submit. This prevents accidental submission of misrecognised speech.

---

### 4.4 Smart Doctor Discovery

**Step 1 — Symptom to Specialisation (Gemini Flash):**

```
POST /api/doctors/match
Body: { symptoms: string }

Gemini prompt:
  "A patient describes their symptoms as: [symptoms]
   Based on these symptoms, recommend the single most appropriate
   medical specialisation from this list: [General Physician, Cardiologist,
   Dermatologist, Orthopaedist, Neurologist, Gynaecologist, Paediatrician,
   Psychiatrist, ENT Specialist, Ophthalmologist].
   Respond ONLY with a JSON object: { specialisation: string, reason: string }"

Response: { specialisation: 'Cardiologist', reason: '...' }
```

If Gemini response fails JSON parse: fall back to 'General Physician' with reason "Could not determine specialisation — showing all doctors."

**Step 2 — Doctor listing with quality scores:**

```
GET /api/doctors?specialisation=Cardiologist

Query:
  SELECT d.*, u.name,
    AVG(r.clarity) as avg_clarity,
    AVG(r.time_given) as avg_time,
    AVG(r.prescription_quality) as avg_prescription,
    AVG(r.overall) as avg_overall,
    COUNT(r.id) as total_ratings
  FROM doctor_profiles d
  JOIN users u ON d.user_id = u.id
  LEFT JOIN ratings r ON r.doctor_id = u.id
  WHERE d.specialisation = ?
  GROUP BY d.id, u.id
  ORDER BY avg_overall DESC NULLS LAST
```

**Doctor card data returned:**
`id, name, specialisation, experience_years, consultation_fee, bio, avg_overall, total_ratings, next_available_slot`

---

### 4.5 Appointment Booking

**Slot availability query:**

```sql
SELECT * FROM availability_slots
WHERE doctor_id = ?
AND day_of_week = ?
AND id NOT IN (
  SELECT slot_id FROM appointments
  WHERE scheduled_at::date = ?
  AND status NOT IN ('CANCELLED', 'EXPIRED')
)
```

**Double-booking prevention:**
Unique constraint at DB level:
```sql
UNIQUE (doctor_id, scheduled_at)
```
If two concurrent requests try to book the same slot, the second INSERT fails with a unique constraint violation. The API catches this and returns `409 Conflict — slot already taken`.

**Booking:**
```
POST /api/appointments
Body: { doctorId, scheduledAt }

Server:
  1. Verify slot is available (query above)
  2. INSERT appointment with status PENDING
  3. Return { appointmentId, doctorName, scheduledAt }
```

---

### 4.6 AI Pre-Consultation Triage (Gemini Flash)

This is the core USP of SwasthConnect. The patient completes a structured symptom form before the consultation. Gemini Flash processes the input and generates a clinical summary in English, regardless of the input language. The doctor sees this summary before admitting the patient.

**Triage form fields (collected in frontend, sent to backend):**

```typescript
interface TriageInput {
  chiefComplaint: string;       // voice or text, any language
  duration: string;             // e.g. "3 days", "since yesterday"
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  existingConditions: string[]; // multi-select: Diabetes, Hypertension, etc.
  currentMedications: string;   // free text
  additionalNotes: string;      // optional
  inputLanguage: string;        // from i18next current language
}
```

**Gemini Flash prompt:**

```
POST /api/triage
Body: { appointmentId, triageInput }

System prompt:
  "You are a medical pre-consultation assistant.
   The patient's input may be written in any Indian language (Hindi, Kannada,
   Tamil, Telugu, Bengali, or English). Translate if needed.
   Generate a structured clinical summary in English for the doctor.

   Patient input:
   - Chief complaint: [chiefComplaint]
   - Duration: [duration]
   - Severity: [severity]
   - Existing conditions: [existingConditions]
   - Current medications: [currentMedications]
   - Additional notes: [additionalNotes]
   - Original input language: [inputLanguage]

   Respond ONLY with this JSON structure:
   {
     chiefComplaint: string,
     duration: string,
     severity: string,
     urgency: 'ROUTINE' | 'PRIORITY' | 'EMERGENCY',
     clinicalSummary: string,
     flaggedSymptoms: string[],
     recommendedActions: string
   }

   Urgency classification:
   - EMERGENCY: chest pain, difficulty breathing, loss of consciousness,
     severe bleeding, stroke symptoms, anaphylaxis
   - PRIORITY: high fever (>103°F), severe pain, worsening chronic condition
   - ROUTINE: all other presentations"
```

**Error handling:**

```typescript
try {
  const parsed = JSON.parse(geminiResponse);
  await db.triageSummary.create({ ...parsed, originalPatientText, inputLanguage });
  await db.appointment.update({ status: 'TRIAGED' });
} catch {
  // Gemini returned malformed JSON — store raw text, still mark TRIAGED
  await db.triageSummary.create({
    aiSummary: geminiResponse,  // store raw
    urgency: 'ROUTINE',         // safe default
    originalPatientText,
    inputLanguage
  });
}
```

**What the doctor sees (in their queue and during call):**

```
┌─────────────────────────────────────────────────────┐
│ 🔴 EMERGENCY — Rajesh Kumar                         │
│                                                     │
│ Chief Complaint: Chest pain radiating to left arm   │
│ Duration: 2 hours                                   │
│ Severity: SEVERE                                    │
│ Existing Conditions: Hypertension, Diabetes         │
│ Current Medications: Metformin 500mg, Amlodipine    │
│                                                     │
│ Clinical Summary: Patient presents with acute       │
│ onset chest pain with radiation to left arm for     │
│ 2 hours. Given cardiac risk factors (HTN, DM),      │
│ this presentation warrants urgent assessment.       │
│                                                     │
│ Flagged Symptoms: Chest pain, radiation pattern     │
│                                                     │
│ Patient's original words (Hindi):                   │
│ "सीने में दर्द हो रहा है और बांह में भी..."         │
└─────────────────────────────────────────────────────┘
```

Note: Original patient text always shown alongside English summary so doctor can catch any mistranslation.

**Appointment status update:** PENDING → TRIAGED on successful triage submission.

---

### 4.7 Real-Time Waiting Room (SSE)

SSE is used instead of WebSocket because all real-time communication in the waiting room is unidirectional — server pushes status updates to both patient and doctor. No client-to-server messaging happens over the real-time channel.

**SSE endpoint:**

```
GET /api/waiting-room/stream?appointmentId=xxx
Headers: Authorization: Bearer <token>
Response: Content-Type: text/event-stream
```

**Server implementation:**

```typescript
app.get('/api/waiting-room/stream', authMiddleware, (req, res) => {
  const { appointmentId } = req.query;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Register this connection in memory map
  sseClients.set(appointmentId, res);

  // Heartbeat every 30s to prevent proxy timeouts
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(appointmentId);
  });
});
```

**In-memory client store (sufficient for portfolio scale):**
```typescript
const sseClients = new Map<string, Response>();
```

**SSE event types:**

| Event | Fired by | Received by | Trigger |
|---|---|---|---|
| `PATIENT_WAITING` | Server (on patient SSE connect) | Doctor dashboard | Patient opens waiting room |
| `ADMIT_PATIENT` | Server (on doctor clicking Admit) | Patient waiting room | PATCH /appointments/:id/status → ACTIVE |
| `CALL_ENDED` | Server (on call end) | Both parties | PATCH /appointments/:id/status → CALL_ENDED |
| `APPOINTMENT_EXPIRED` | Server (cron check at 30 min) | Patient | 30 min elapsed, no admission |

**Event format:**

```
event: ADMIT_PATIENT
data: {"appointmentId":"abc123","roomId":"room_abc123"}

```

**Client (EventSource):**

```typescript
const es = new EventSource(
  `/api/waiting-room/stream?appointmentId=${appointmentId}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

es.addEventListener('ADMIT_PATIENT', (e) => {
  const { roomId } = JSON.parse(e.data);
  navigate(`/patient/call/${appointmentId}`);
});
```

**Reconnection:** EventSource auto-reconnects on connection drop (browser-native). Exponential backoff is browser-managed. On reconnect, server re-checks appointment status from DB and sends current state.

**30-minute timeout:**
```typescript
// On patient SSE connect, schedule expiry check
setTimeout(async () => {
  const appt = await db.appointment.findUnique({ where: { id: appointmentId }});
  if (appt.status === 'WAITING') {
    await db.appointment.update({ status: 'EXPIRED' });
    sendSSEEvent(appointmentId, 'APPOINTMENT_EXPIRED', {});
  }
}, 30 * 60 * 1000);
```

---

### 4.8 Video Consultation (PeerJS WebRTC)

**Why PeerJS, not SFU:**
SwasthConnect calls are always exactly 2 parties (1 patient, 1 doctor). An SFU (mediasoup, Twilio Video, 100ms) is designed for multi-party calls and costs money. PeerJS provides P2P WebRTC signalling for free and is the correct tool for this use case.

**PeerJS server (self-hosted on Render):**

```typescript
import { PeerServer } from 'peer';

const peerServer = PeerServer({
  port: 9000,
  path: '/peerjs',
});
```

Mounted on the same Render instance as the Express API.

**Call initiation flow:**

```
1. Doctor clicks "Admit Patient"
   → PATCH /api/appointments/:id/status { status: 'ACTIVE' }
   → Server fires SSE event ADMIT_PATIENT to patient
   → Both client navigates to /call/:appointmentId

2. Doctor page loads → creates PeerJS instance with peerId = `doctor_${appointmentId}`
   → Waits for incoming call

3. Patient page loads → creates PeerJS instance with peerId = `patient_${appointmentId}`
   → Calls `peer.call('doctor_${appointmentId}', localStream)`

4. Doctor receives 'call' event → answers with localStream → bidirectional video established
```

**Audio-only fallback:**

```typescript
// On call initiation, attempt video first
let localStream: MediaStream;
try {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  setCallMode('video');
} catch {
  // Camera unavailable or denied — fall back to audio only
  localStream = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true,
  });
  setCallMode('audio');
  showToast(t('video_unavailable_audio_only'));
}
```

If video stream drops mid-call (network degradation), the connection continues on audio track. A banner displays: "Video paused — audio only."

**PeerJS connection error handling:**

```typescript
peer.on('error', (err) => {
  if (err.type === 'peer-unavailable') {
    showToast(t('doctor_not_ready'));
    // Retry after 3 seconds
    setTimeout(initiateCall, 3000);
  }
  if (err.type === 'network') {
    showToast(t('connection_lost'));
  }
});
```

**Call end flow:**

```typescript
// Either party clicks "End Call"
connection.close();
peer.destroy();
await axios.patch(`/api/appointments/${appointmentId}/status`, { status: 'CALL_ENDED' });
// Server fires SSE CALL_ENDED to both parties
// Doctor navigates to /doctor/prescription/:appointmentId
// Patient navigates to /patient/post-call/:appointmentId
```

---

### 4.9 Prescription Generation (pdfkit + Cloudinary)

**Trigger:** Doctor submits prescription form after call ends.

**Flow:**

```
POST /api/prescriptions/generate
Body: {
  appointmentId,
  diagnosis,
  medicines: [{ name, dosage, frequency, duration }],
  doctorNotes,
  followUpDate (optional),
  referralSpecialisation (optional)
}

Server:
  1. Fetch appointment + triage summary + doctor + patient from DB
  2. Generate PDF with pdfkit
  3. Upload PDF buffer to Cloudinary
  4. Store Cloudinary URL in consultations.prescription_url
  5. Update appointment status → COMPLETED
  6. Return { prescriptionUrl }
```

**PDF structure (pdfkit):**

```typescript
import PDFDocument from 'pdfkit';
import { v2 as cloudinary } from 'cloudinary';

const generatePrescription = async (data): Promise<string> => {
  const doc = new PDFDocument({ margin: 50 });
  const buffers: Buffer[] = [];

  doc.on('data', chunk => buffers.push(chunk));

  // Header
  doc.fontSize(20).text('SwasthConnect', { align: 'center' });
  doc.fontSize(10).text('Telemedicine Prescription', { align: 'center' });
  doc.moveDown();

  // Doctor info
  doc.fontSize(12).text(`Dr. ${data.doctorName}`);
  doc.text(`${data.specialisation} | Reg. No: ${data.licenseNumber}`);
  doc.moveDown();

  // Patient + date
  doc.text(`Patient: ${data.patientName}  |  Age: ${data.age}  |  Date: ${new Date().toLocaleDateString('en-IN')}`);
  doc.moveDown().moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // Diagnosis
  doc.fontSize(14).text('Diagnosis:');
  doc.fontSize(11).text(data.diagnosis);
  doc.moveDown();

  // Medicines
  doc.fontSize(14).text('Medications:');
  data.medicines.forEach((med, i) => {
    doc.fontSize(11).text(`${i + 1}. ${med.name} — ${med.dosage}, ${med.frequency}, for ${med.duration}`);
  });
  doc.moveDown();

  // Notes
  if (data.doctorNotes) {
    doc.fontSize(14).text('Doctor Notes:');
    doc.fontSize(11).text(data.doctorNotes);
    doc.moveDown();
  }

  // Follow-up
  if (data.followUpDate) {
    doc.text(`Follow-up: ${new Date(data.followUpDate).toLocaleDateString('en-IN')}`);
  }

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const result = await cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'prescriptions', format: 'pdf' },
        (err, res) => {
          if (err) reject(err);
          else resolve(res.secure_url);
        }
      );
      result.end(pdfBuffer);
    });
  });
};
```

**Cloudinary upload error handling:**
- Retry once on failure
- If second attempt fails: store prescription text in DB, set `prescription_url = null`, show "PDF generation pending" on patient dashboard

---

### 4.10 Patient Health Timeline

**Query (sorted newest first):**

```sql
SELECT
  a.id, a.scheduled_at, a.status,
  d.name as doctor_name, dp.specialisation,
  ts.chief_complaint, ts.urgency, ts.ai_summary,
  ts.original_patient_text, ts.original_input_language,
  c.diagnosis, c.doctor_notes, c.prescription_url,
  c.follow_up_date, c.referral_specialisation,
  r.overall as rating_overall,
  fu.response as followup_response
FROM appointments a
JOIN users d ON a.doctor_id = d.id
JOIN doctor_profiles dp ON dp.user_id = d.id
LEFT JOIN triage_summaries ts ON ts.appointment_id = a.id
LEFT JOIN consultations c ON c.appointment_id = a.id
LEFT JOIN ratings r ON r.appointment_id = a.id
LEFT JOIN follow_up_requests fu ON fu.appointment_id = a.id
WHERE a.patient_id = ?
AND a.status = 'COMPLETED'
ORDER BY a.scheduled_at DESC
```

Each timeline card shows: date, doctor name, specialisation, chief complaint, urgency badge, diagnosis, prescription download link, rating given, and follow-up response.

---

### 4.11 Post-Consultation Rating

**4 dimensions, each scored 1–5:**
- Clarity of Explanation
- Time Given
- Prescription Quality
- Overall Experience

**Submission:**
```
POST /api/ratings
Body: { appointmentId, clarity, timeGiven, prescriptionQuality, overall }

Constraints:
  - One rating per appointment (UNIQUE appointmentId in ratings table)
  - Only submitted after COMPLETED status
  - Only by the patient who booked the appointment
```

**Aggregated quality score (used in doctor listing):**
```sql
SELECT
  AVG(clarity) as avg_clarity,
  AVG(time_given) as avg_time,
  AVG(prescription_quality) as avg_prescription,
  AVG(overall) as avg_overall,
  COUNT(*) as total_ratings
FROM ratings
WHERE doctor_id = ?
```

---

### 4.12 Post-Consultation Follow-Up (node-cron)

**node-cron job — runs nightly at 00:00 IST:**

```typescript
import cron from 'node-cron';

cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Running follow-up job:', new Date().toISOString());
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find all COMPLETED appointments from 3 days ago with no follow-up yet
    const appointments = await db.appointment.findMany({
      where: {
        status: 'COMPLETED',
        scheduledAt: {
          gte: new Date(threeDaysAgo.setHours(0, 0, 0, 0)),
          lte: new Date(threeDaysAgo.setHours(23, 59, 59, 999)),
        },
        followUpRequest: null,
      },
    });

    for (const appt of appointments) {
      await db.followUpRequest.create({
        data: {
          appointmentId: appt.id,
          sentAt: new Date(),
          response: null,
          doctorFlagged: false,
          seenByDoctor: false,
        },
      });
    }

    console.log(`[CRON] Created ${appointments.length} follow-up requests`);
  } catch (err) {
    console.error('[CRON] Follow-up job failed:', err);
  }
}, {
  timezone: 'Asia/Kolkata',
});
```

**Manual trigger route (for testing and demos only):**

```
POST /api/followup/trigger   (no auth — disable in production)
```

**Patient response:**

```
POST /api/followup/:appointmentId/respond
Body: { response: 'BETTER' | 'SAME' | 'WORSE' }

Server:
  1. Update follow_up_requests: response, responded_at
  2. If WORSE: set doctor_flagged = true
  3. Return updated follow-up object
```

**Doctor flag display:**

```
GET /api/followup/flags
→ SELECT * FROM follow_up_requests
  WHERE doctor_flagged = true
  AND seen_by_doctor = false
  AND appointment.doctor_id = req.user.id
```

Shown as a red alert banner on doctor dashboard. Clicking "View" sets `seen_by_doctor = true` and dismisses the banner.

---

## 5. Non-Functional Requirements

| Requirement | Target | Approach |
|---|---|---|
| API response time | < 500ms (p95, non-AI routes) | Index on appointment.patient_id, doctor_id, status |
| AI triage response | < 5s (Gemini Flash) | gemini-1.5-flash model; timeout at 8s with fallback |
| SSE latency | < 300ms event propagation | In-memory Map; no DB read on SSE push |
| PeerJS connection establishment | < 10s | STUN servers configured; retry on peer-unavailable |
| PDF generation | < 3s | pdfkit is synchronous; Cloudinary upload is the bottleneck |
| Concurrent SSE connections | 50+ without degradation | Map-based; stateless backend |
| Uptime | Best-effort on free tier | Render may cold-start; README documents pre-warm |
| TypeScript coverage | 100% on shared types | Strict mode in tsconfig |
| i18next coverage | 100% of UI strings | ESLint no-literal-string enforced |

---

## 6. Security

| Area | Implementation |
|---|---|
| Auth | JWT, 7-day expiry, HS256 signed with env secret |
| Password storage | bcrypt, cost factor 12 |
| Input validation | Zod on all POST/PATCH bodies; SQL injection impossible via Prisma parameterised queries |
| HTTPS | Enforced by Vercel + Render (automatic TLS) |
| CORS | `cors()` configured to allow only Vercel frontend origin |
| Sensitive env vars | `.env` — JWT_SECRET, GEMINI_API_KEY, CLOUDINARY credentials, DATABASE_URL — never committed |
| API key exposure | Gemini API key is server-side only; never sent to frontend |
| WebRTC | P2P encrypted by default (DTLS-SRTP) |
| Patient data | No PII in SSE events; only appointmentId and status sent over the wire |
| Role enforcement | Every protected route checks req.user.role; middleware cannot be bypassed |

**Out of scope for v1 (portfolio project):** HIPAA compliance, audit logging, end-to-end encryption of medical records, penetration testing.

---

## 7. Third-Party Dependencies

| Service | Purpose | Free Tier Limit | Fallback |
|---|---|---|---|
| Google Gemini Flash API | AI triage + specialisation matching | 15 RPM / 1M tokens/day | Raw symptom text shown to doctor |
| Cloudinary | Prescription PDF storage | 25GB storage, 25K transformations/month | Store text in DB, show "PDF pending" |
| Neon PostgreSQL | Primary database | 512MB storage, 1 compute unit | N/A (hard dependency) |
| Vercel | Frontend hosting | 100GB bandwidth/month | N/A |
| Render | Backend hosting | 750 hours/month | N/A |
| PeerJS (self-hosted) | WebRTC signalling | Free (self-hosted on Render) | Audio-only fallback |

**Note on PeerJS STUN/TURN:**
PeerJS uses Google's public STUN servers by default (`stun:stun.l.google.com:19302`). For NAT traversal in restrictive networks, TURN server support may be needed. For v1/demo environments, STUN is sufficient.

---

## 8. Deployment Architecture

```
Production Environment
─────────────────────

Domain: swasthconnect.vercel.app
  └── Vercel (Static + SSR)
        └── React build artifacts
        └── Environment: VITE_API_URL=https://swasthconnect-api.onrender.com

API: swasthconnect-api.onrender.com
  └── Render (Node.js free tier)
        └── Express API server
        └── PeerJS server on /peerjs
        └── node-cron jobs (timezone: Asia/Kolkata)
        └── Environment variables: DATABASE_URL, JWT_SECRET,
            GEMINI_API_KEY, CLOUDINARY_*, CLIENT_URL

Database: Neon (serverless PostgreSQL)
  └── Connection via DATABASE_URL in Render env
  └── Prisma migrations applied via `prisma migrate deploy`
  └── Connection pooling: Neon's built-in serverless pooler

File storage: Cloudinary
  └── Prescriptions stored in /prescriptions folder
  └── resource_type: raw (PDF)
  └── Secure URLs returned and stored in consultations table
```

**Cold start note:** Render free tier spins down after 15 minutes of inactivity. The first API call after inactivity takes ~10–15 seconds. Document this in README; pre-warm before demo interviews by hitting `/api/health` endpoint 30 seconds before demo.

**Health check endpoint:**
```
GET /api/health → { status: 'ok', timestamp: '...' }
```

---

## 9. Open Questions & Decisions Log

| # | Question | Decision | Date |
|---|---|---|---|
| 1 | WebSocket vs SSE for waiting room | SSE — unidirectional push is sufficient; no client-to-server real-time messaging needed | July 2026 |
| 2 | Redis for session / caching | Rejected — JWT is stateless; no caching needed at portfolio scale | July 2026 |
| 3 | SFU vs P2P for video | P2P (PeerJS) — calls are always 1:1; SFU is overengineering | July 2026 |
| 4 | SMS notifications | Rejected for v1 — in-app notifications sufficient; SMS is post-v1 | July 2026 |
| 5 | PWA / offline support | Rejected for v1 — adds Workbox complexity; symptom capture offline is post-v1 | July 2026 |
| 6 | TURN server for WebRTC | Deferred — STUN sufficient for demo; TURN needed for production NAT traversal | July 2026 |
| 7 | Gemini Flash vs Gemini Pro | Flash — faster inference, lower cost, sufficient quality for triage | July 2026 |
| 8 | PDF via pdfkit vs Puppeteer | pdfkit — no headless browser needed; simpler, faster, lighter | July 2026 |
| 9 | Doctor UI language | Always English — doctors are medical professionals; translation would add risk to clinical data | July 2026 |
| 10 | Follow-up timing | 3 days post-consultation — clinically appropriate for most acute conditions | July 2026 |

---

*SwasthConnect TRD v2.0 — July 2026*
*Built to fix what eSanjeevani got wrong.*
