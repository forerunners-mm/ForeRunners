# SRHR Learning Myanmar

**Learn. Play. Grow.**  
Digital SRHR learning and community awareness for adolescent girls in six selected wards of Insein Township, Yangon Region, Myanmar.

## Project snapshot

- **Duration:** 12 months
- **Target:** 600 adolescent girls aged 10–19
- **Lead:** Nway Htway Eain Organization (NHE)
- **Technical support:** ForeRunners Organization (FR)
- **Proposed budget:** USD 120,000 (planning estimate; subject to donor eligibility and detailed costing)

## Partnership roles

NHE leads community entry, participant engagement, awareness sessions, community initiatives, local coordination and referral coordination. FR provides the digital learning platform, learning tools, technical support and digital monitoring. Qualified SRHR professionals must review educational content before publication.

## Learning components

1. Learning Center — structured lessons.
2. Quiz Center — reviewed questions with a pass threshold.
3. Game Center — planned interactive learning games; not yet implemented in this Apps Script pilot.
4. AI Learning Companion — planned; disabled until approved SRHR sources, safety testing and professional review are completed.
5. Learner dashboard — anonymous learner ID and progress summary.

## Repository structure

- `docs/PROJECT-CONCEPT.md` — project concept note.
- `docs/SAFEGUARDING-AND-DATA.md` — minimum safeguarding and privacy requirements.
- `docs/DEPLOYMENT-GUIDE.md` — Apps Script setup and deployment.
- `budget/budget.csv` — proposed partner budget.
- `apps-script/Code.gs` — Apps Script backend.
- `apps-script/Index.html` — bilingual learner website.

## Google Apps Script setup

1. Create a dedicated Google Sheet for this pilot.
2. Open **Extensions → Apps Script** from that Sheet.
3. Replace the default script with the contents of `apps-script/Code.gs`.
4. Add an HTML file named exactly `Index` and paste `apps-script/Index.html`.
5. Save the project.
6. Select and run `setupProject()` once from the Apps Script editor. Review and authorize the requested permissions.
7. Confirm that the Sheets named Users, Levels, QuizQuestions, UserProgress, ActivityLog and Settings were created.
8. Add SRHR lessons and quiz questions only after qualified review. Follow the column definitions in the Sheets and the deployment guide.
9. Deploy first to a restricted test group. Do not make it publicly available to children until the safeguarding, privacy, security and referral requirements are approved.
10. Test with dummy accounts and dummy content.

## Important implementation status

This is a **pilot MVP**, not a production-ready child-facing service.

Implemented in this version:
- Anonymous account creation (pseudonymous learner ID; token hash stored in Sheets).
- Published lesson listing and lesson display.
- Lesson-read recording.
- Quiz retrieval and server-side scoring.
- 70% quiz pass threshold.
- Sequential level completion and progress dashboard.

Not implemented:
- AI chat integration.
- Interactive Game Center.
- Admin interface / role-based publishing.
- Rate limiting and advanced abuse protection.
- Independent security assessment or production-grade authentication.
- Full offline mode.

Do not claim these features are operational until they have been built and tested.

## Privacy and safeguarding

- Do not collect learner names, phone numbers, addresses, school names or sensitive health/sexual information in this prototype.
- The anonymous token is stored in the learner's browser local storage. This is a pilot convenience, not strong authentication.
- Do not use public leaderboards or publish identifiable learner data.
- Do not store AI chat transcripts by default; AI integration is currently disabled.
- Obtain appropriate consent/assent and guardian involvement as required and safe.
- Establish a designated safeguarding focal person and verified referral pathways before involving minors.
- See `docs/SAFEGUARDING-AND-DATA.md`.

## Budget note

The USD 120,000 partner allocation is a proposed planning estimate, not an approved grant budget. Confirm donor eligibility, quantities, unit costs, staffing and eligible cost rules before submission.
