# Safeguarding, Privacy and Responsible Technology Framework
## SRHR Learning Myanmar

**Status:** Draft for partner and qualified safeguarding review. Not legal advice or a substitute for an approved organization-wide policy. Applies to NHE, FR, staff, volunteers, facilitators, consultants and vendors acting for the project.

## 1. Core commitments

- Best interests, dignity, safety and rights of every child are paramount.
- Participation is voluntary, non-discriminatory and age-appropriate.
- No child is required to disclose sexual, reproductive, health or trauma information.
- Personnel maintain professional boundaries and do not initiate secret/private communications with children.
- Do not promise absolute confidentiality; explain limits in age-appropriate language.
- Technology is educational only, not a health, counseling, protection or emergency service.
- Concerns are promptly reported to the designated safeguarding focal person.

## 2. Mandatory pre-launch readiness gate

No child-facing activity, recruitment, digital launch, identifiable photography or participant-data collection may begin until the project lead documents approval of all applicable items:

- [ ] Partner agreement identifies safeguarding lead, focal persons, decision rights and incident notification timelines.
- [ ] Project-specific child safeguarding risk assessment approved.
- [ ] Child safeguarding policy and staff/volunteer code of conduct approved.
- [ ] Personnel suitability checks completed where lawful and feasible.
- [ ] All personnel trained on boundaries, safe facilitation, disclosures, reporting and referrals.
- [ ] Named primary and alternate safeguarding focal persons with safe contact method.
- [ ] Age-appropriate information, consent and assent materials approved.
- [ ] Guardian consent process assessed for necessity, safety and applicable requirements; do not involve a caregiver if doing so may increase risk.
- [ ] Health, psychosocial and child-protection referral directory verified.
- [ ] Disclosure and urgent-risk response SOP rehearsed.
- [ ] Accessible complaints and feedback mechanisms available.
- [ ] Privacy assessment and retention/deletion schedule approved.
- [ ] Digital security review and dummy-data tests completed.
- [ ] Qualified SRHR reviewer approved every lesson and quiz to be published.
- [ ] Accessible and offline alternatives available.
- [ ] Incident recording, escalation and secure storage arrangements tested.

A signed gate record must identify approvers, date, evidence and restrictions. If a critical item is incomplete, postpone or limit the activity; do not waive it informally.

## 3. Consent, assent and voluntary participation

1. Explain activity purpose, topics, format, possible discomforts, data collected, access, confidentiality limits, complaints route and right to stop.
2. Use language and format understandable to the participant's age and literacy.
3. Obtain voluntary participant assent and guardian consent where required by applicable law, donor rules and qualified safeguarding advice.
4. Assess whether guardian involvement is safe and appropriate in context. Escalate uncertainty to the safeguarding lead and qualified local adviser.
5. Attendance, silence or device use is not consent.
6. Obtain separate optional permission for photographs, recordings, quotations or case studies. Default is no identifiable images or stories of minors.
7. Provide non-digital participation and do not penalize refusal.
8. Keep minimum consent evidence separately from learning progress data with restricted access.

## 4. Staff and volunteer code — minimum rules

Personnel must treat children respectfully; use accountable communication channels; avoid isolated one-to-one settings and follow approved observable-space/two-adult practices where feasible; never request intimate images or personal details; never exchange gifts, money or favors for access; never use disappearing messages or personal social media for secret contact; never meet participants privately outside approved arrangements; never promise secrecy about harm; and report concerns promptly.

Prohibited conduct includes sexual exploitation or abuse, grooming, harassment, corporal punishment, discrimination, retaliation, coercion and misuse of participant data. Allegations must be handled fairly and in a survivor-centered manner, prioritizing immediate safety and avoiding repeated questioning.

## 5. Responding to a disclosure or concern

**Facilitator / volunteer**
1. Stay calm, listen, take the child seriously and thank them for telling you.
2. Do not investigate, interrogate, ask leading questions or request repeated details.
3. Do not promise secrecy. Explain that information will be shared only with people who need to help keep them safe.
4. Ask only what is necessary to understand immediate safety and urgent help needs.
5. Do not confront the alleged person or contact a caregiver without guidance if that could increase risk.
6. Contact the designated safeguarding focal person promptly using the secure route.
7. Record the child's words accurately, separating direct quotes from observations; do not speculate.
8. Follow the approved referral and emergency procedure, sharing minimum necessary information.
9. Never enter case details in the learning platform, general attendance sheet, group email or public report.

**Safeguarding focal person**
- Assess immediate safety and urgent health/protection needs with qualified services.
- Explain options and confidentiality limits in age-appropriate language.
- Make a safe referral with appropriate consent/assent and in line with applicable duties.
- Keep a restricted case record separate from program monitoring data.
- Notify authorized organizational leadership and donor only as required, without unnecessary identifiers.
- Document actions and follow-up securely; prevent retaliation and unnecessary disclosure.

This framework does not define local mandatory-reporting law. NHE must obtain qualified local advice and document applicable reporting duties and safe referral routes before implementation.

## 6. Referral pathway requirements

Before activities, map and verify adolescent-friendly/general health care, SRHR clinical care, psychosocial support, child protection/violence response, emergency medical care and disability-related support.

For each service record: service scope, eligibility/age limits, hours, safe contact, cost if verified, accessibility, language, referral procedure, confidentiality limits, verification date and backup option. Keep sensitive provider contacts restricted. Re-verify at least monthly and after reported changes. Never promise availability until verified.

## 7. Data protection and information governance

### Data minimization
The digital pilot should not collect names, phone numbers, exact addresses, school names, photographs, identity documents, sexual history, pregnancy status, diagnoses, abuse histories or free-text personal disclosures. Do not add such fields without a documented necessity assessment and approval.

### Separate records
- Consent/contact records, if required, are separate from pseudonymous learning progress.
- Safeguarding case records are held separately in restricted case-management storage.
- Routine monitoring uses aggregate counts and non-identifying codes.
- Access is role-based and reviewed quarterly and whenever personnel leave.

### Access and security
- Use individual accounts, strong authentication and least-privilege access.
- Do not share spreadsheets or web-app URLs publicly.
- Do not use public leaderboards, public profiles, third-party ad trackers or open analytics on child-facing pages.
- Restrict exports/downloads and maintain access logs where available.
- Remove access promptly when roles end.
- Never place credentials, tokens, participant data or private referral records in GitHub.
- Test with dummy data until security approval is documented.

### Current prototype age-path control — limitations
- The prototype uses separate facilitator-issued access codes for the 10–14 and 15–19 learning pathways. The code determines the pathway; the system does not verify a participant's actual age or identity.
- Facilitators must distribute the correct code only after following the approved age-appropriate enrolment and consent/assent process. Access codes are shared group credentials and may be forwarded; they are not proof of age, consent or eligibility.
- Do not request a date of birth merely to make the current prototype work. If a safer enrolment method is required, obtain safeguarding and privacy review before collecting additional information.
- The platform enforces the assigned pathway for published lessons on the server, but this control does not replace facilitator oversight, consent/assent, independent security review or age-appropriate content review.
- Access codes must be configured as Apps Script Script Properties, never in source code, Sheets, browser HTML, public documents or GitHub. Rotate codes if disclosed and document who is authorized to distribute them.
- The current session token is stored in browser session storage and expires after 12 hours. This is a prototype measure, not protection against a compromised device, malicious browser extension or script injection.
- No real child data may be entered until the full release gate is approved.

### Retention and deletion
Define retention by record type, purpose, applicable legal/donor requirement and deletion method before launch. Keep data only as long as necessary. Securely delete or anonymize at the end of the approved period, subject to lawful preservation requirements, and document deletion.

### Incident response
Any suspected loss, unauthorized access, disclosure, phishing, device compromise or misdirected communication must be reported immediately to the data/security focal person. Preserve evidence, restrict access, assess harm, contain the incident, notify leadership and affected people/regulators/donor where required, and document corrective action. Do not conceal a serious incident.

## 8. Digital platform and AI rules

### Initial pilot
- Restricted access only; no open public deployment for children.
- Dummy-data testing before any real use.
- No open chat, direct messaging, photo upload, location tracking, public profile or public leaderboard.
- No real learner data in the Apps Script prototype until an independent review confirms adequate authentication, access control, storage, retention and incident handling.
- Provide offline/facilitated alternatives.

### AI disabled for initial phase
No AI assistant is to be exposed to child participants in the initial phase. A future AI feature requires:
1. Written approval from NHE, FR, qualified SRHR and child-safeguarding reviewers, and donor where applicable.
2. Curated, version-controlled, expert-approved knowledge base with references and review dates.
3. Age-specific response rules and strict topic boundaries.
4. Independent privacy/security assessment; no participant data used to train models.
5. No default chat transcript storage; any proposed retention requires separate necessity and consent assessment.
6. Safety testing for disclosures, urgent risks, misinformation, explicit requests and attempts to bypass safeguards.
7. Clear notice that AI is not a clinician, counselor or emergency service.
8. Human referral route; AI must not decide safeguarding cases.
9. Ongoing monitoring, shutdown mechanism and accountable owner.

AI must not diagnose, prescribe, recommend medication, determine whether abuse occurred, provide individualized clinical advice or replace a trained human.

## 9. Complaints and feedback

Offer at least two safe channels, including one not controlled by the facilitator. Explain who receives complaints, response expectations, confidentiality limits and protection from retaliation. Provide child-friendly and accessible formats. Store complaints in a restricted register. Serious safeguarding complaints go directly to the safeguarding lead and must not be handled solely by the person complained about.

## 10. Approval and review

Adapt this framework to NHE and FR policies, local requirements, donor standards and actual context. Review before launch, quarterly, and after incidents or material changes. Record version, approver, date and changes. This document is not evidence that controls are already operational.
