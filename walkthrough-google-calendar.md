# Complete Integration Walkthrough

Everything below covers what was built in the CRM backend and exactly what you need to do in the `lp-video-questionnaire` project.

---

## Part 1: Interests API (Done ✅)

### Endpoints

| Action | Method | URL | Auth |
|---|---|---|---|
| Create Interest | `POST` | `/api/interests/` | None |
| Update (Questionnaire) | `PATCH` | `/api/interests/<uuid:id>/` | None |
| List All | `GET` | `/api/interests/list/` | None |
| Delete | `DELETE` | `/api/interests/<uuid:id>/delete/` | None |

### Anti-bot protection
If someone POSTs with an email or phone that already exists, the backend **patches the existing record** instead of creating a duplicate. The response still returns the correct `id`.

### What to do in LP project

**1. `LandingPage.tsx` → `handleSubmit`:**
```tsx
const res = await fetch("http://127.0.0.1:8000/api/interests/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    first_name: formData.get("firstName"),
    email: formData.get("email"),
    phone: formData.get("phone") || null,
    role: role,
    other_role: role === "None of the above" ? formData.get("otherRole") : null
  })
});
const data = await res.json();
localStorage.setItem("interestId", data.id);  // ⚠️ CRITICAL
router.push("/video");
```

**2. `VideoExperience.tsx` → after all questions answered:**
```tsx
const interestId = localStorage.getItem("interestId");
await fetch(`http://127.0.0.1:8000/api/interests/${interestId}/`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ questionnaire_data: updatedAnswers })
});
```

---

## Part 2: Google Calendar API (Done ✅)

### New Endpoints

| Action | Method | URL | Auth | Description |
|---|---|---|---|---|
| Calendar OAuth Login | `GET` | `/api/google/calendar-login/` | Token (admin) | Returns Google OAuth URL to connect calendar |
| Calendar OAuth Callback | `GET` | `/api/google/calendar-callback/` | None | Google redirects here after consent |
| Get Availability | `GET` | `/api/google/calendar/availability/` | None (public) | Returns available 30-min slots |
| Book a Slot | `POST` | `/api/google/calendar/booking/` | None (public) | Creates Google Calendar event + Meet link |

### How it works

- The CRM uses a **separate Google OAuth client** (`GOOGLE_CALENDAR_CLIENT_ID`) so it doesn't conflict with your SEO/Search Console integration.
- The CRM admin connects their calendar **once** via the OAuth flow. After that, the public endpoints use the stored refresh token automatically.
- Booking automatically creates a **Google Meet link** and sends an **email invite** to the lead (Google handles the email, not the CRM).

---

### Step 1: Connect Calendar (One-time Admin Setup)

> [!IMPORTANT]
> Before this works, you must add `http://127.0.0.1:8000/api/google/calendar-callback/` as an **Authorized Redirect URI** in your Google Cloud Console for the calendar client ID (`214041899629-7k03rqnqr9dft672dnfijopvkhta2n4e`).

1. Login to CRM admin panel
2. Open browser console and run:
```js
fetch('/api/google/calendar-login/', {
  headers: { 'Authorization': 'Token YOUR_ADMIN_TOKEN' }
}).then(r => r.json()).then(d => window.open(d.auth_url))
```
3. Complete the Google consent screen
4. Calendar is now connected! The refresh token is stored securely in the DB.

---

### Step 2: Get Available Slots (Public)

**Request:**
```
GET /api/google/calendar/availability/?date=2026-08-25&timezone=Asia/Kolkata
```

**Response:**
```json
{
  "date": "2026-08-25",
  "timezone": "Asia/Kolkata",
  "available_slots": [
    {"start": "2026-08-25T10:00:00+05:30", "end": "2026-08-25T10:30:00+05:30"},
    {"start": "2026-08-25T10:30:00+05:30", "end": "2026-08-25T11:00:00+05:30"},
    {"start": "2026-08-25T11:00:00+05:30", "end": "2026-08-25T11:30:00+05:30"},
    {"start": "2026-08-25T14:00:00+05:30", "end": "2026-08-25T14:30:00+05:30"}
  ]
}
```

**Details:**
- Working hours: **10:00 AM – 6:00 PM** (Mon-Sun)
- Slot size: **30 minutes**
- Already booked slots are **automatically hidden**
- Past times for today are **automatically hidden**
- Timezone: Defaults to `Asia/Kolkata`

---

### Step 3: Book a Slot (Public)

**Request:**
```
POST /api/google/calendar/booking/
Content-Type: application/json

{
  "interest_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "start_time": "2026-08-25T10:00:00+05:30",
  "end_time": "2026-08-25T10:30:00+05:30",
  "timezone": "Asia/Kolkata"
}
```

**Response:**
```json
{
  "success": true,
  "event_id": "google_event_id_123",
  "meet_link": "https://meet.google.com/abc-defg-hij",
  "summary": "Intro Call: John Doe"
}
```

**What happens automatically:**
- ✅ Google Calendar event created on CRM owner's calendar
- ✅ Google Meet link generated
- ✅ Email invite sent to the lead (by Google)
- ✅ Interest status updated to `meeting_booked`

---

### What to implement in LP project (Calendar UI)

After the questionnaire is completed, show a calendar booking page. Here's the flow:

```tsx
// 1. Fetch available slots for a selected date
const res = await fetch(
  `http://127.0.0.1:8000/api/google/calendar/availability/?date=${selectedDate}&timezone=Asia/Kolkata`
);
const { available_slots } = await res.json();

// 2. Display slots as buttons, user picks one

// 3. Book the selected slot
const interestId = localStorage.getItem("interestId");
const bookRes = await fetch("http://127.0.0.1:8000/api/google/calendar/booking/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    interest_id: interestId,
    start_time: selectedSlot.start,
    end_time: selectedSlot.end,
    timezone: "Asia/Kolkata"
  })
});
const booking = await bookRes.json();

// 4. Show confirmation with Meet link
console.log(booking.meet_link);  // "https://meet.google.com/abc-defg-hij"
```

---

## Files Changed in CRM Backend

### New Files
- [`calendar_utils.py`](file:///D:/BotAgency/CRM-Bot/crm-latest/backend/apps/google_api/calendar_utils.py) — Separate OAuth helpers for Calendar client
- [`calendar_views.py`](file:///D:/BotAgency/CRM-Bot/crm-latest/backend/apps/google_api/calendar_views.py) — 4 new views: login, callback, availability, booking

### Modified Files
- [`.env`](file:///D:/BotAgency/CRM-Bot/crm-latest/backend/.env) — Added `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `GOOGLE_CALENDAR_REDIRECT_URI`
- [`settings.py`](file:///D:/BotAgency/CRM-Bot/crm-latest/backend/crm_project/settings.py) — Added calendar config variables
- [`urls.py`](file:///D:/BotAgency/CRM-Bot/crm-latest/backend/apps/google_api/urls.py) — Added 4 calendar URL routes
- [`models.py`](file:///D:/BotAgency/CRM-Bot/crm-latest/backend/apps/interests/models.py) — Added `meeting_booked` status choice

## What's Left To Do

- [ ] **Google Cloud Console:** Add `http://127.0.0.1:8000/api/google/calendar-callback/` as Authorized Redirect URI for the calendar client ID
- [ ] **Connect Calendar:** Admin logs into CRM and triggers the Calendar OAuth flow once
- [ ] **LP Project:** Implement calendar date picker + slot selection UI after questionnaire
- [ ] **LP Project:** Wire up the `availability` and `booking` fetch calls shown above
- [ ] **Production:** Update all `http://127.0.0.1:8000` URLs to your production domain
