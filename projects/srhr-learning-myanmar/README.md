# SRHR Learning Myanmar

**Learn. Play. Grow.**  
A proposed community-led SRHR education and restricted digital learning initiative for adolescent girls in six selected wards of Insein Township, Yangon Region, Myanmar.

> **Status: planning and prototype stage.** This repository does not establish that the project is funded, approved, operational or ready for child-facing deployment.

## Project snapshot

- Proposed duration: 12 months
- Proposed direct reach: 600 adolescent girls aged 10–19
- Proposed coverage: six selected wards, Insein Township
- Proposed lead: Nway Htway Eain Organization (NHE), subject to donor eligibility confirmation
- Proposed technical support: ForeRunners Organization (FR)
- Indicative planning ceiling: USD 120,000, subject to detailed costing and donor rules

## Roles

NHE is proposed to lead community entry, participant engagement, facilitated learning, community initiatives, safeguarding coordination and local referral coordination. FR is proposed to provide digital platform and technical support, privacy-conscious monitoring and technical training. Roles, financial accountability, data access and safeguarding responsibilities must be confirmed in a signed partnership agreement.

## Learning approach

- Ages 10–14: foundational puberty, body awareness, menstrual basics, boundaries and trusted support.
- Ages 15–19: expanded reproductive health, consent, respectful relationships, rights, safety and service navigation.
- Facilitated and offline alternatives; device ownership is not required.
- All SRHR content and quizzes require qualified review before publication.

## Digital status

The Apps Script application is a prototype. It currently supports pseudonymous accounts, published lesson listing, lesson-read recording, quiz scoring and a progress view. It uses a browser-stored session token and is not production-grade authentication.

Not implemented or approved for child-facing use:
- Age-based account assignment and access enforcement.
- Admin interface and role-based publishing.
- AI Learning Companion.
- Game Center.
- Rate limiting and independent security assessment.
- Production-grade authentication and complete retention/deletion workflows.

**AI chat is disabled for the initial phase.** Do not use real child data or deploy publicly to minors until safeguarding readiness and technical/privacy security reviews are complete.

## Key documents

- docs/PROJECT-CONCEPT.md — revised project concept.
- docs/SAFEGUARDING-AND-DATA.md — safeguarding, consent, disclosure, referral and data framework.
- docs/DEPLOYMENT-GUIDE.md — restricted pilot deployment and test requirements.
- docs/MEL-FRAMEWORK.md — proposed monitoring, evaluation and learning framework.
- docs/BUDGET-NOTES.md — costing assumptions and donor checks.
- budget/budget.csv — provisional allocation; not a donor-approved detailed budget.
- apps-script/Code.gs and apps-script/Index.html — current prototype source.

## Non-negotiable release conditions

1. NHE eligibility and partner roles confirmed.
2. Written partnership and data responsibility agreement approved.
3. Child safeguarding policy, code, focal persons and disclosure SOP approved.
4. Age-appropriate consent/assent and safe caregiver involvement process approved.
5. Local referral directory verified and maintained.
6. SRHR curriculum and quiz content approved by qualified reviewers.
7. Privacy and security assessment completed; technical risks remediated.
8. Dummy-data tests passed and release approval documented.
9. Donor eligibility and detailed budget approved.

Until then, keep the platform restricted to dummy-data testing. Never publish participant or safeguarding data in this repository.
