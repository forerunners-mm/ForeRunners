# Safeguarding, Privacy and Responsible Technology

This is a readiness checklist, not legal advice or a substitute for an approved child safeguarding policy.

## Before any child-facing pilot

- [ ] Confirm NHE's legal/operational eligibility and the partnership arrangement with FR.
- [ ] Approve a project-specific child safeguarding policy and staff/volunteer code of conduct.
- [ ] Appoint a safeguarding focal person and define escalation responsibilities.
- [ ] Train staff and facilitators on safe participation, disclosures, boundaries and referrals.
- [ ] Establish age-appropriate consent and assent procedures, including guardian involvement where required and safe.
- [ ] Identify qualified SRHR content reviewers.
- [ ] Map and verify health, psychosocial and child-protection services in the target wards.
- [ ] Establish a safe disclosure and referral protocol; do not promise confidentiality beyond what can be provided.
- [ ] Complete a privacy/data-protection assessment and define retention/deletion periods.
- [ ] Test the website with dummy accounts and dummy content before involving participants.
- [ ] Establish a process to report and respond to security incidents.
- [ ] Confirm accessible and offline alternatives for learners without devices or internet.

## Data minimization

The current prototype creates a pseudonymous learner ID and stores a hash of a random session token. It does not require names, phone numbers, addresses, school names, photographs or personal health histories. Do not add sensitive fields to the learner database.

The current browser stores the session token in local storage. This is not strong authentication and may be accessible to another person using the same device. Use only for a restricted pilot with dummy data until an appropriate security review and safer authentication design are completed.

## SRHR content governance

- Use reputable, current and locally appropriate educational sources.
- Have qualified SRHR professionals review content for accuracy, age suitability and cultural context.
- Maintain source references, review dates, reviewer details and version history.
- Separate content for ages 10–14 and 15–19 where developmentally appropriate.
- Avoid collecting personal disclosures through lessons, quizzes or free-text forms.

## AI safety status

AI integration is **not enabled** in the current Apps Script project.

Before adding AI, restrict answers to a curated, reviewed SRHR knowledge base; have qualified reviewers approve the content and test questions; clearly identify the assistant as an educational tool, not a clinician; do not diagnose, prescribe or provide emergency intervention; establish safe responses for abuse disclosures and urgent concerns; provide verified human referral pathways; do not retain chat transcripts by default; and test harmful, inaccurate, age-inappropriate and biased outputs.

## Public deployment gate

Do not deploy this prototype publicly for minors until the organization has approved its safeguarding policy, consent/assent process, referral arrangements, privacy assessment, access controls, technical security review and qualified content review.
