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

## Database and access model

Migration: `supabase/migrations/20261105160000_add_learner_initial_assessments.sql`.

The dedicated `public.learner_initial_assessments` table stores:
- UUID primary key and learner profile foreign key.
- `draft` or `submitted` status and a form version.
- Structured JSONB answers, constrained to an object and a 32 KB maximum.
- Separate optional counselor-contact consent and timestamp.
- Created, updated and submitted timestamps.
- At most one draft per learner; submitted assessments are immutable. A learner can create a new assessment later.

Security:
- RLS is enabled.
- Approved Learners can create and manage only their own draft, submit it, read their own submitted records, and delete only their own draft.
- Admins can read records for programme administration.
- Trainer, Counselor/Mentor and opportunity-provider access is not granted by this migration.
- No broad counselor access until a separate authorized role and case-assignment model is designed.
- Opportunity organizations must never query this table.
- Do not store unnecessary sensitive information or place answers in public URLs, analytics events or logs.

The migration is committed for review but has not been applied to the live Supabase project. Apply only after reviewing the SQL and confirming the migration plan.

## Acceptance criteria

1. Learner can save a draft and resume later.
2. Required questions are minimal; optional questions can be skipped.
3. Form works in Myanmar and English and on mobile.
4. Learner can review and submit; duplicate drafts are prevented.
5. Learner can see their own submitted summary.
6. Counselor contact consent is separate, optional and auditable.
7. RLS tests confirm one learner cannot read another learner's assessment.
8. Admin access is role-checked; Trainer and external opportunity providers do not receive access by default.
9. Existing skills profile, portfolio, readiness assessment and applications continue working.
10. No automated score determines eligibility or pathway.

## Implementation sequence

1. Review and apply the dedicated table/RLS migration.
2. Build bilingual multi-step draft/review/submit UI.
3. Add learner summary and explicit counselor-contact request.
4. Add admin/case-assignment workflow only after Counselor/Mentor role and access model are approved.
5. Add recommendation logic only after the training catalogue is tagged by pathway and People, Profit and Planet outcomes.
