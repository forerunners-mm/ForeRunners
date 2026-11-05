# Livelihood Development Journey — Data Model

The learner journey is a progression model, not a course category list. Course levels (BASIC / ADVANCED) remain unchanged.

## Seven stages
1. Self-Discovery & Assessment
2. Foundation & Life Skills
3. Skill Development
4. Practical Application
5. Income Generation
6. Growth & Stability
7. Leadership & Sustainability

## Data model
- `livelihood_stages`: bilingual stage catalogue and expected outcomes.
- `modules.stage_no`: optional mapping from an existing learning module to the stage it most directly supports. Existing course and module records are preserved.
- `learner_stage_progress`: one private record per learner and stage, with learner evidence and Admin verification.

## Progression and safeguards
- A learner can start Stage 1. Starting a later stage requires the previous stage to be verified.
- Learners can submit evidence for review; a submission requires a meaningful evidence summary.
- Only authorized Admins can verify a stage or write reviewer feedback.
- Stage completion is not inferred from course completion alone. Practical evidence and human review are required.
- A learner's chosen livelihood pathway is not fixed by this stage sequence. Employment, self-employment, apprenticeship, further training and exploring remain options.
- Stage 4 is intentionally left without an existing module mapping until practical tasks and portfolio evidence are explicitly designed.
- Existing enrollments, course levels, lesson progress and certificates are not changed by this migration.

## Release note
This is a proposed additive migration. Apply it only after reviewing the PR and validating the SQL on a disposable Supabase project. Do not run the repository recovery snapshot against production.
