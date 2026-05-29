# Play Console: Data Safety form — exact answers for Kharcha

This is the cheat sheet for the **Data Safety** form (App content → Data safety) so you can fill it in 10 minutes without guesswork. Each section maps to a specific Play Console question.

> Source of truth: every claim here matches `client/public/privacy-policy.html`. If you change the policy, update this doc.

---

## 1. Data collection and security (top-level)

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS only) |
| Do you provide a way for users to request that their data is deleted? | **Yes** — `https://<your-host>/account-deletion.html` and in-app Settings → Delete Account |

---

## 2. Data types — declare each as Collected / Shared

For each item: **Collected = Yes**, **Shared = Yes/No** as below, **Optional/Required**, **Purpose**.

> "Shared" means transferred to a **third party** in a way they could use it (e.g. AI providers process your text). Hosting providers (Render) are **not** "sharing".

### Personal info

| Data | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| **Name** | Yes | No | Optional | App functionality, Personalisation |
| **Phone number** | Yes | No | Required | Account management (OTP login) |
| **Email** | No | — | — | — |
| **User IDs** | Yes | No | Required | Account management (internal user id) |
| **Address** | No | — | — | — |

### Financial info

| Data | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| **User payment info** | No | — | — | — |
| **Purchase history** | Yes | No | Optional | App functionality (bills, transactions you log) |
| **Credit score** | No | — | — | — |
| **Other financial info** | Yes | No | Optional | App functionality (budgets, subscriptions you log) |

### Health & fitness

All **No**.

### Messages

| Data | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| **In-app messages** | Yes | **Yes** — to Google Gemini / Anthropic | Optional | App functionality (AI assistant generates replies) |

### Photos & videos

| Data | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| **Photos** | Yes | **Yes** — to Google Gemini | Optional | App functionality (Bill OCR: extract items + total from receipts you scan; not stored after extraction) |

### Audio files

| Data | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| **Voice or sound recordings** | No (voice-to-text runs locally in browser; raw audio never uploaded) | — | — | — |

### Files & docs

All **No**.

### Calendar / Contacts / Location

All **No**.

### App activity

| Data | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| **App interactions** | Yes | No | Required | Analytics (e.g. affiliate clicks), App functionality |
| **In-app search history** | Yes | No | Required | App functionality (Prices search, Pantry search) |
| **Installed apps** | No | — | — | — |
| **Other user-generated content** | Yes | No | Optional | App functionality (grocery items, pantry items, meal plans) |
| **Other actions** | No | — | — | — |

### Web browsing

All **No**.

### App info and performance

| Data | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| **Crash logs** | Yes | No | Required | App functionality, Bug-fixing |
| **Diagnostics** | Yes | No | Required | Performance |
| **Other app performance data** | No | — | — | — |

### Device or other IDs

| Data | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| **Device or other IDs** | Yes | No | Required | Account management (push-notification tokens, session tokens) |

---

## 3. Data security practices (final section)

| Question | Answer |
|---|---|
| Is all of the user data collected by your app encrypted in transit? | **Yes** |
| Do you provide a way for users to request that their data is deleted? | **Yes** |
| Are you committed to following the Google Play Families Policy? | **No** (we are 13+, not a family/kids app) |
| Has your app been independently validated against a global security standard? | **No** (unless you want to commit to one) |

---

## 4. Audio rationale (Play sometimes asks)

Voice input in the Add-Item sheet uses the browser's **Web Speech API** (`SpeechRecognition`). Audio is processed *on-device by the browser* and only the resulting text is sent to our server. We **do not** collect, store, or transmit audio files. The microphone permission is requested by the browser, not by Kharcha directly.

---

## 5. Ads declaration

- **Ads:** No
- **In-app purchases:** No (until you add Premium)

When you add Razorpay-based Premium later, switch in-app purchases to **Yes**.

---

## 6. Account deletion declaration

- Provide this URL in Play Console:
  - `https://<your-production-host>/account-deletion.html`
- In-app deletion path: Settings → Delete Account.
- Honour timeline: 30 days (already stated in our policy).

---

## 7. Privacy policy URL

- `https://<your-production-host>/privacy-policy.html`

Both URLs must return HTTP 200 from a public, non-authenticated browser. Test before you submit — Play crawls them.

---

## 8. Final pre-submit checklist

- [ ] Privacy policy URL returns 200 (incognito browser)
- [ ] Account deletion URL returns 200 (incognito browser)
- [ ] In-app **Settings → Delete Account** end-to-end works (manually test)
- [ ] The data-types you ticked above match the policy exactly
- [ ] You are NOT collecting anything not listed above (one stray analytics SDK can fail the review)
- [ ] You have a working **support email** (`support@kharcha.app`) that you actually monitor
