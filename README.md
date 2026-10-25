# ForeRunners Organization

**Empowering Youth. Strengthening Communities. Creating Change.**

ForeRunners is a Myanmar-based community-based organization founded in 2024. Its registration is not yet complete. This repository contains the source for the organization's bilingual public website and a foundation for its future digital learning resources.

## Website

- Main page: `index.html`
- Styles: `assets/css/styles.css`
- Language toggle and mobile navigation: `assets/js/app.js`
- Automated GitHub Pages deployment: `.github/workflows/pages.yml`

The site supports English and Myanmar language switching and is designed for mobile, tablet and desktop screens.

## Program focus

1. Mental Health and Psychosocial Support (MHPSS)
2. Capacity Building and Leadership
3. Economic Development and Livelihoods
4. Digital Literacy, Digital Safety and Responsible AI
5. Green Business and Environmental Resilience
6. Gender Equality, Inclusion and Community Empowerment

## Run locally

This is a static website and does not require Node.js or a package installation. Open `index.html` in a browser, or run a simple local web server from the repository root:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

1. Open repository **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Open the **Actions** tab and check the **Deploy ForeRunners website to GitHub Pages** workflow.
4. After a successful run, open **Settings → Pages** to find the published site URL.

The workflow deploys the static website whenever changes are pushed to `main`, or when manually triggered. GitHub Pages may take a few minutes to publish after a successful deployment.

## Content and safeguarding

- Keep the organization's legal status accurate; do not imply registration is complete until confirmed.
- Do not publish personal data, confidential community case records, beneficiary names, private contact details or sensitive operational information.
- Add only verified program outcomes, donor relationships, funding awards and project results.
- Learning materials should be reviewed for accuracy, accessibility, safeguarding and cultural relevance before publication.
- This repository currently provides a public-facing website foundation; it does not yet implement user accounts, a learning management backend, project tracking database or donor CRM.

## Next development phases

- Add reviewed Myanmar and English learning modules, quizzes and downloadable resources.
- Add a secure contact and partnership enquiry process.
- Design project, MEAL and donor tracking systems with appropriate access controls before storing any sensitive data.
- Add accessibility checks and automated link/site validation.

## Maintainer

ForeRunners Organization — Myanmar
