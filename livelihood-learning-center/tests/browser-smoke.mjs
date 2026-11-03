import { chromium } from "playwright";

const errors = [];
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  page.on("pageerror", error => errors.push(error.message));

  await page.goto("http://127.0.0.1:4173/livelihood-learning-center/", {
    waitUntil: "domcontentloaded",
    timeout: 30000
  });
  await page.waitForSelector("#auth-section:not(.hidden)", { timeout: 30000 });

  if (!(await page.title()).includes("Livelihood Learning Center")) {
    throw new Error("Unexpected page title.");
  }
  for (const id of ["#learner-section", "#trainer-section", "#admin-section", "#pending-section"]) {
    if (await page.locator(id).isVisible()) {
      throw new Error("Protected workspace visible without authentication: " + id);
    }
  }

  const initialHeading = await page.locator("#auth-section h2").innerText();
  await page.locator("#lang-toggle").click();
  const translatedHeading = await page.locator("#auth-section h2").innerText();
  if (initialHeading === translatedHeading) {
    throw new Error("Language toggle did not change the authentication heading.");
  }

  await page.locator("#signup-tab").click();
  if (!(await page.locator("#name-field").isVisible())) {
    throw new Error("Sign-up mode did not reveal the full-name field.");
  }
  if ((await page.locator("#auth-submit").innerText()).trim().length === 0) {
    throw new Error("Sign-up submit button has no label.");
  }

  await page.locator("#login-tab").click();
  if (await page.locator("#name-field").isVisible()) {
    throw new Error("Login mode did not hide the full-name field.");
  }

  if (errors.length) {
    throw new Error("Browser runtime errors: " + errors.join(" | "));
  }
  console.log("Browser smoke test passed: initial auth view, protected-workspace visibility, bilingual toggle and sign-up/login mode.");
} finally {
  await browser.close();
}
