# Digital Learning Pilot — Technical Deployment and Safety Guide

**Status:** Restricted pilot guidance. The current Apps Script application is a prototype, not production-ready for children or sensitive participant data.

## 1. Approved initial scope

The initial pilot may include reviewed bilingual lessons separated by age pathway, reviewed knowledge quizzes with no personal disclosures, minimal pseudonymous progress and facilitator resources. Do not activate AI chat, open text entry, user-generated games, public profiles, leaderboards, direct messaging, photo upload or location collection.

## 2. Pre-deployment conditions

Do not deploy to real participants until the safeguarding readiness gate is signed, partner/data responsibilities are agreed in writing, SRHR professionals approve all content, privacy and retention arrangements are approved, technical security review is complete, access is restricted to the intended group and offline alternatives are ready.

## 3. Current prototype — limitations

The repository Apps Script prototype supports anonymous account creation, pseudonymous IDs, token-hash storage, lesson listing, lesson-read recording, quiz scoring and progress display. It seeds 100 unpublished placeholder levels.

It does not provide production-grade authentication or recovery, age-based account assignment/access enforcement, admin interface or role-based publishing, rate limiting, robust audit logging, independent security testing, full retention/deletion workflow, offline synchronization, AI chat or operational Game Center.

The browser stores a session token in local storage. Anyone with access to the same browser profile may be able to use the session. Do not store real child records or sensitive information until reviewed and remediated.

## 4. Build and configuration

1. Use an organization-approved Google account and recovery process; do not make a staff member's personal account the sole owner.
2. Create a dedicated Google Sheet with access limited to named administrators.
3. Open Apps Script from that Sheet and add the reviewed Code.gs and Index.html.
4. Run setupProject() once and confirm expected tabs and headers.
5. Keep lesson and quiz data unpublished by default.
6. Add dummy content only for technical testing.
7. Verify execution identity and restrict access to named testers.
8. Record script/sheet owner, authorized users, deployment version, restricted URL location and emergency disable procedure in an operations register.
9. Do not publish restricted deployment URLs on public websites or repositories.
10. Re-test after every code or configuration change.

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
| New anonymous account | Unique pseudonymous ID and token |
| Invalid/expired token | Safely rejected |
| Unpublished lesson | Not listed and cannot be opened |
| Published lesson | Only approved fields displayed |
| Age pathway | Only assigned age-appropriate content accessible; implement and test before child use |
| Lesson prerequisite | Later lesson blocked until prerequisite completed |
| Quiz scoring | Server scores only published questions for that lesson |
| Missing/duplicate/foreign question IDs | Rejected or handled deterministically; cannot inflate score |
| Incomplete quiz | Clearly rejected or marked incomplete |
| Repeated submission | Progress remains consistent; log behavior documented |
| Unauthorized spreadsheet user | Access denied |
| Direct API request | Cannot bypass authorization or publication checks |
| Export | No unnecessary identifiers or sensitive fields |
| Shared device | Session reset/sign-out process works and limitations explained |
| Incident disable | Authorized owner can suspend access promptly |

The current code must be reviewed against these cases. Manual tests are not independent security assurance.

## 7. Data and access rules

Use pseudonymous learner IDs only. Do not add name, phone, email, exact location, school, health status, sexual history or free-text disclosure fields. Separate consent evidence and safeguarding case records from learning progress. Restrict spreadsheet access to named staff and review quarterly. Do not share credentials or tokens. Never put secrets, participant data or private referral details in GitHub. Define retention/deletion before real data collection. Disable unnecessary analytics, trackers and third-party embeds.

## 8. Incident and maintenance

Document technical owner and backup. For suspected account compromise or data exposure: restrict or disable access, preserve relevant logs, notify the designated organizational focal person immediately, assess impact, follow the incident plan and document remediation. Maintain change logs, backup/restore tests, dependency reviews and access reviews.

## 9. AI and games

AI remains disabled. Do not add a general-purpose chatbot as a shortcut. A future AI feature requires curated expert-approved sources, age-specific controls, no default transcript retention, disclosure handling, human referral, safety testing and written approval. Game Center is not implemented; begin with reviewed facilitated/offline learning games. Digital games must not collect personal information or reward public disclosure.

## 10. Release approval record

Before real participant release, record version/date, technical test evidence and reviewer, content approval list, safeguarding gate approval, privacy/security approval, operational owner and incident contact, approved access scope, rollback/disable plan and donor/partner approval where required. If any approval is missing, keep the deployment restricted to dummy-data testing.
