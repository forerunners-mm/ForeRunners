# Learner Initial Assessment — Functional Specification

## Purpose

Create a structured, bilingual (Myanmar/English) intake assessment that helps each learner and the ForeRunners team understand the learner's current situation before recommending a learning or livelihood pathway. The assessment informs a conversation; it must not automatically decide a learner's future.

## Relationship to existing features

The current Learner Profile remains the learner's CV-oriented record. The existing Career Readiness Self-Assessment remains a confidence-rating exercise. This new Initial Assessment is a separate guided intake that captures context, goals, barriers and support preferences. Avoid asking learners to re-enter information already available in their profile; prefill where safe and let the learner correct it.

## Learner journey

1. Explain purpose, who can view the answers, and that sensitive or optional questions may be skipped.
2. Collect answers in short sections with a progress indicator and Save Draft.
3. Let the learner review and submit the assessment.
4. Show a plain-language summary to the learner.
5. Allow the learner to request a Career Counselor / Business Mentor conversation.
6. Keep recommendations in a separate human-reviewed step. Do not generate or publish an automated pathway decision from the assessment alone.

## Sections and proposed questions

### A. Current situation
- Current situation: studying; employed; self-employed; seeking work; not currently seeking work; unpaid care responsibilities; temporarily unable to work; other; prefer not to say.
- Township/region and preferred work location (optional).
- Preferred work mode: on-site; remote; hybrid; flexible; no preference.
- Time available for learning/work: under 5 hours/week; 5–10; 11–20; over 20; varies.
- Preferred learning mode: in-person; online; blended; self-paced; no preference.
- Device/internet access: reliable; sometimes available; limited; no personal device; prefer not to say.

### B. Education and experience
- Highest education level completed (including no formal schooling and currently studying).
- Relevant courses, certificates or informal learning (optional).
- Work, business, volunteer, caregiving or community experience (include unpaid experience).
- Tasks the learner has done confidently.
- Existing portfolio, work sample or certificate (optional; reuse existing portfolio links where possible).

### C. Interests and goals
- Main interest areas (multi-select, configurable catalogue).
- Goal for the next 3–6 months: find a job; improve current job; start/grow a small business; earn through small projects/freelance; apprenticeship; continue education/training; explore options; other.
- Longer-term goal (optional free text).
- Preferred pathway: employment; self-employment; apprenticeship/work-based learning; further training; exploring/undecided.
- Learner may select more than one interest and change their pathway later.

### D. Skills and learning needs
- Self-reported skills: communication; teamwork; problem solving; digital skills; numeracy; literacy/language; customer service; sales/marketing; bookkeeping; technical/vocational skills; planning/organization; other.
- Skills the learner wants to develop (multi-select plus optional text).
- Preferred learning pace: foundational; intermediate; advanced; unsure.
- Language preference for learning: Myanmar; English; both; other.
- Optional evidence or examples. Do not treat self-reported skill levels as certified competence.

### E. Barriers and support preferences
- Optional barriers affecting learning/work: cost; transport; time; caring responsibilities; disability/accessibility; device/connectivity; language; safety; documentation; confidence; other; prefer not to say.
- What kind of support would help? career guidance; business mentoring; vocational course advice; digital access; accessibility accommodation; learning support; referral to another service; not sure.
- Would you like a confidential conversation with a Career Counselor or relevant mentor? yes; no; maybe later.
- Best contact method and safe contact time only if the learner requests follow-up.
- Do not ask for diagnosis, trauma details, political/religious affiliation, or other unnecessary sensitive information.

### F. Review and consent
- Show a review page with edit links.
- Required acknowledgement: answers are used to understand learning and livelihood needs and support recommendations.
- Separate optional consent for a counselor/mentor to contact the learner.
- Explain that opportunity providers do not receive the full assessment; only information explicitly shared by the learner for a specific application.
- Explain that learners can skip optional questions and request correction/deletion through the stated support channel.

## Recommendation and referral rules

- Recommendations should cite the learner's stated goal, relevant skills and identified learning gaps in plain language.
- Offer multiple suitable options where possible; include a "not sure / speak to a person" route.
- A human counselor/mentor reviews referrals and any high-impact recommendation.
- No numeric employability score, rejection, course denial or opportunity exclusion based only on this assessment.
- Never infer a learner's suitability from disability, gender, age, income, location or other protected/sensitive characteristics.
- Clearly distinguish paid jobs, paid projects, stipends, unpaid internships and volunteer opportunities.

## Data and access requirements

Proposed dedicated table: `learner_initial_assessments` with:
- `id` UUID primary key
- `learner_id` UUID referencing the authenticated profile
- `status` constrained to `draft` or `submitted`
- `answers` JSONB for versioned structured answers
- `form_version` text
- `contact_consent` boolean default false
- `submitted_at`, `created_at`, `updated_at` timestamps

Security requirements:
- Learners can select and edit only their own draft/submitted assessment, subject to a clear resubmission/version policy.
- Admins can access assessment records for program administration.
- Career Counselors / Mentors must have an explicit authorized role and only access cases assigned to them; do not grant broad access merely because they are a Trainer.
- Opportunity organizations must never query this table.
- Enforce RLS and privilege checks in database policies/functions. Do not rely on hidden UI controls.
- Avoid storing unnecessary sensitive data. Do not place assessment answers in public URLs, analytics events or logs.
- Before implementation, inspect current profile roles and RLS conventions and prepare a reviewed migration. Do not run the recovery schema snapshot as a migration.

## Acceptance criteria

1. Learner can save a draft and resume later.
2. Required questions are minimal; optional questions can be skipped.
3. Form works in Myanmar and English and on mobile.
4. Learner can review and submit; duplicate submissions are handled predictably.
5. Learner can see their own submitted summary.
6. Counselor contact consent is separate, optional and auditable.
7. RLS tests confirm one learner cannot read another learner's assessment.
8. Admin access is role-checked; Trainer and external opportunity providers do not receive access by default.
9. Existing skills profile, portfolio, readiness assessment and applications continue working.
10. No automated score determines eligibility or pathway.

## Implementation sequence

1. Inspect existing migrations, profile role model and RLS policies.
2. Add the dedicated table, constraints, indexes and RLS policies in a reviewed migration.
3. Add bilingual multi-step UI with draft/save/review/submit states.
4. Add learner summary and an explicit counselor-contact request.
5. Add admin/case-assignment workflow only after the Counselor/Mentor role and access model are approved.
6. Add recommendation logic only after the training catalogue is tagged by pathway and People, Profit and Planet outcomes.

