# SRHR Learning Myanmar

**Digital Learning, Community Awareness and Women's Empowerment for Adolescent Girls**  
**Location:** Six wards, Insein Township, Yangon Region, Myanmar  
**Duration:** 12 months  
**Target:** 600 adolescent girls  
**Proposed budget:** USD 120,000

## Partnership

- **Lead organization:** Nway Htway Eain Organization (NHE)
- **Technical support partner:** ForeRunners Organization (FR)

NHE leads community awareness sessions, community initiative activities, community engagement and local implementation. FR provides the digital learning website, AI-assisted learning design, quizzes, educational games and technical support.

## Project components

1. Community awareness sessions (NHE)
2. Community initiative activities (NHE)
3. SRHR Learning Center (FR technical support)
4. Quiz Center (FR technical support)
5. Game Center (FR technical support)
6. AI Learning Companion based on reviewed SRHR resources (FR technical support)
7. Monitoring, evaluation, safeguarding and referrals (joint)

## Proposed 100-level learning pathway

- Levels 1–20: Puberty and body awareness
- Levels 21–40: Menstrual health and hygiene
- Levels 41–60: Reproductive health
- Levels 61–80: Consent, relationships and personal safety
- Levels 81–100: SRHR, rights and informed decision-making

All educational content must be reviewed by qualified SRHR professionals before publication. The learning pathway is a planning framework, not a completed curriculum.

## Budget allocation

| Category | NHE (USD) | FR (USD) | Total (USD) |
|---|---:|---:|---:|
| Project coordination and personnel | 15,000 | 3,000 | 18,000 |
| Community awareness sessions | 24,000 | 0 | 24,000 |
| Community initiative activities | 15,000 | 0 | 15,000 |
| SRHR educational materials and accessibility | 6,000 | 2,000 | 8,000 |
| Website and AI assistant development | 0 | 20,000 | 20,000 |
| Digital learning content and gamification | 0 | 10,000 | 10,000 |
| Monitoring, evaluation and learning | 5,000 | 3,000 | 8,000 |
| Safeguarding, referral support and staff training | 3,000 | 2,000 | 5,000 |
| Transportation and field operations | 5,000 | 0 | 5,000 |
| Administration and communications | 1,500 | 1,500 | 3,000 |
| Contingency (only if funder permits) | 2,000 | 2,000 | 4,000 |
| **TOTAL** | **76,500** | **43,500** | **120,000** |

This is a proposed planning budget, not an approved grant budget. Confirm eligible costs, staffing, quantities, procurement estimates and any funder restrictions before submission.

## Prototype status

This repository folder is a project starter. The included Apps Script files are a basic prototype, not a production-ready service. Do not use real child data in testing. Before piloting, complete SRHR expert review, child safeguarding and privacy review, access controls, secure session handling, referral mapping and testing.

## Google Apps Script setup

1. Create a dedicated Google Sheet for the project.
2. Open **Extensions → Apps Script** from that Sheet.
3. Copy `Code.gs` and `Index.html` from this folder into the Apps Script project.
4. Run `setupProject()` once and authorize it.
5. Deploy as a web app for a restricted test group first. Review Google Apps Script quotas and access settings before expanding.
6. Never store API keys in client-side HTML or commit secrets to GitHub.

The current starter intentionally does not include an AI API integration or public prize registration. Add those only after approved SRHR source materials and safeguarding procedures are in place.

## Data protection principles

- Use pseudonymous learner IDs; do not collect names, phone numbers, addresses or school names for ordinary learning.
- Do not show identifiable public leaderboards.
- Do not store AI chat transcripts by default.
- Do not collect guardian contact details in the learning database.
- Use age-appropriate consent/assent and guardian procedures where required.
- Provide a clear human referral pathway; the AI is educational and is not a clinician or emergency service.

## Organizations

- Lead: Nway Htway Eain Organization (NHE)
- Technical support: ForeRunners Organization (FR)
