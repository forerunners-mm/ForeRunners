# Digital Learning Pilot — Technical Deployment and Safety Guide

**Status:** Restricted pilot guidance. The current Apps Script application is a prototype, not production-ready for children or sensitive participant data.

## 1. Approved initial scope

The initial pilot may include reviewed bilingual lessons separated by age pathway, reviewed knowledge quizzes with no personal disclosures, minimal pseudonymous progress and facilitator resources. Do not activate AI chat, open text entry, user-generated games, public profiles, leaderboards, direct messaging, photo upload or location collection.

## 2. Pre-deployment conditions

Do not deploy to real participants until the safeguarding readiness gate is signed, partner/data responsibilities are agreed in writing, SRHR professionals approve all content, privacy and retention arrangements are approved, technical security review is complete, access is restricted to the intended group and offline alternatives are ready.

## 3. Current prototype — limitations

The repository Apps Script prototype supports anonymous account creation, pseudonymous IDs, token-hash storage, lesson listing, lesson-read recording, quiz scoring and progress display. It seeds 100 unpublished placeholder levels.

The revised prototype now includes facilitator-issued age-path access codes, server-side pathway checks on lesson access, expiring pseudonymous sessions, session revocation, browser-tab session storage, a minimum 32-character access-code requirement; the prototype does not implement application-level failed-code throttling, quiz question-ID validation and locking around progress writes. These are prototype safeguards only, not production-grade authentication or an independent security assurance.

Age assignment is based on which facilitator code is supplied; the system does not verify a learner's age. A facilitator must give the correct pathway code only to the intended group. Access codes are shared group credentials and can be forwarded; rotate them if disclosed. The current implementation does not provide individual invitation codes, verified age/guardian consent, password recovery, a complete admin interface, role-based publishing, robust audit logging, offline synchronization or a full retention/deletion workflow. Do not use it to collect real child records or sensitive information.

## 4. Build and configuration

1. Use an organization-approved Google account and recovery process; do not make a staff member's personal account the sole owner.
2. Create a dedicated Google Sheet with access limited to named administrators.
3. Open Apps Script from that Sheet and add the reviewed Code.gs and Index.html.
4. Run setupProject() once. It adds the new AgeGroup and session-expiry columns to the existing Users and Levels sheets only when the existing headers match; stop if it reports unexpected headers. Existing sessions without expiry values will need to sign in again.
5. In Apps Script > Project Settings > Script Properties, set ACCESS_CODE_10_14 and ACCESS_CODE_15_19 to separate cryptographically random codes of at least 32 characters (prefer 32+ random bytes encoded as hex). The server rejects configured codes shorter than 32 characters. Never place the actual values in GitHub, the Sheet, client-side HTML or a public document. Share each code only with the responsible facilitator for that age group.
6. Set the AgeGroup column in each Levels row to exactly 10-14 or 15-19 before setting IsPublished to TRUE. Blank or mismatched pathways are not accessible. Do not reuse one lesson across both pathways unless it has been separately reviewed and intentionally duplicated for each age group.
7. Keep lesson and quiz data unpublished by default.
8. Add dummy content only for technical testing.
9. Verify execution identity and restrict access to named testers.
10. Record script/sheet owner, authorized users, deployment version, restricted URL location and emergency disable procedure in an operations register.
11. Do not publish restricted deployment URLs or access codes on public websites or repositories.
12. Re-test after every code or configuration change.

## 5. Content publishing workflow

For each lesson and quiz:
1. Assign unique content ID and age pathway.
2. Record source title, publisher, reference/URL, publication date and access date.
3. Obtain qualified SRHR review for factual accuracy.
4. Obtain age-appropriateness and safeguarding review.
5. Record reviewer role, review date, version and approval.
6. Translate and back-check Burmese/English meaning.
7. Conduct adult/qualified reviewer comprehension testing first. Adolescent user testing requires separate ethics and safeguarding approval.
8. Publish only the approved version and maintain a change log.
9. Unpublish promptly if a factual or safety issue is reported.

Do not turn real personal disclosures into examples without appropriate anonymization, consent and safeguarding review.

## 6. Dummy-data test plan

| Test | Expected result |
|---|---|
| Valid facilitator code for 10-14 | Account receives only the 10-14 pathway |
| Valid facilitator code for 15-19 | Account receives only the 15-19 pathway |
| Invalid facilitator code | Rejected; no shared global lockout is triggered |
| Expired session | Rejected after the configured 12-hour session |
| Logout | Session is revoked server-side and token cleared from the tab |
| New anonymous account | Unique pseudonymous ID and token |
| Unpublished lesson | Not listed and cannot be opened |
| Published lesson | Only approved fields displayed |
| Age pathway | Only the assigned pathway's published content is accessible; test direct server calls for both groups |
| Lesson prerequisite | Later lesson blocked until prerequisite completed |
| Quiz scoring | Server scores only published questions for that lesson |
| Missing/duplicate/foreign question IDs | Rejected; cannot inflate score |
| Duplicate IDs in published quiz | Detected and quiz submission rejected |
| Incomplete quiz | Rejected |
| Repeated submission | Progress remains consistent; log behavior documented |
| Unauthorized spreadsheet user | Access denied |
| Direct API request | Cannot bypass authorization or publication checks |
| Export | No unnecessary identifiers or sensitive fields |
| Shared device | Session reset/sign-out process works and limitations explained |
| Incident disable | Authorized owner can suspend access promptly |

The prototype has no per-user or per-IP failed-attempt rate limit because Apps Script does not expose a trustworthy client IP to this implementation. High-entropy codes reduce guessing risk but do not replace production-grade rate limiting, monitoring or abuse controls. Test invalid-code rejection without causing a global lockout. The current code must be reviewed against these cases. Manual tests are not independent security assurance.

## 7. Data and access rules

Use pseudonymous learner IDs only. Do not add name, phone, email, exact location, school, health status, sexual history or free-text disclosure fields. Separate consent evidence and safeguarding case records from learning progress. Restrict spreadsheet access to named staff and review quarterly. Do not share credentials or tokens. Never put secrets, participant data or private referral details in GitHub. Define retention/deletion before real data collection. Disable unnecessary analytics, trackers and third-party embeds.

## 8. Incident and maintenance

Document technical owner and backup. For suspected account compromise or data exposure: restrict or disable access, preserve relevant logs, notify the designated organizational focal person immediately, assess impact, follow the incident plan and document remediation. Maintain change logs, backup/restore tests, dependency reviews and access reviews.

## 9. AI and games

AI remains disabled. Do not add a general-purpose chatbot as a shortcut. A future AI feature requires curated expert-approved sources, age-specific controls, no default transcript retention, disclosure handling, human referral, safety testing and written approval. Game Center is not implemented; begin with reviewed facilitated/offline learning games. Digital games must not collect personal information or reward public disclosure.

## 10. Release approval record

Before real participant release, record version/date, technical test evidence and reviewer, content approval list, safeguarding gate approval, privacy/security approval, operational owner and incident contact, approved access scope, rollback/disable plan and donor/partner approval where required. If any approval is missing, keep the deployment restricted to dummy-data testing.
