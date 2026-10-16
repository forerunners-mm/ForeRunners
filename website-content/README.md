# ForeRunners Website Content Starter
Public-safe draft content adapted from ForeRunners Notion organization strategy, program portfolio and NGO template library (reviewed 17 Oct 2026).

## Files
- `content/organization.json`: website-ready organizational content
- `learning/digital-safety-introduction.md`: sample beginner lesson with questions
- `templates/project-concept-note.md`: blank downloadable project concept note

## React/Vite usage
Import organization data in a React component:
```jsx
import organization from './content/organization.json';
export default function About() { return <section><h1>{organization.name}</h1><p>{organization.mission}</p></section>; }
```
Adjust import paths to your actual project structure. Markdown files require a Markdown renderer or conversion step.

## Publishing checklist
- Confirm organizational wording and approval before publishing.
- Do not publish donor pipelines, internal finances, staff private details, beneficiary records, counseling cases, or safeguarding incidents.
- Confirm project funding and completion before describing any project as delivered.
- This starter is a manual export, **not** an automatic Notion synchronization.
