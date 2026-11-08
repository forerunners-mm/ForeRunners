import { chromium } from "playwright";

const errors = [];
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.addInitScript(() => {
    window.addEventListener("error", event => {
      window.__lvcBrowserErrors = (window.__lvcBrowserErrors || []).concat(
        event.filename + ":" + event.lineno + ":" + event.colno + " " + event.message
      );
    });
  });
  page.on("pageerror", error => errors.push("pageerror: " + (error.stack || error.message)));
  page.on("console", message => { if (message.type() === "error") errors.push("console: " + message.text()); });
  page.on("requestfailed", request => errors.push("requestfailed: " + request.url() + " " + request.failure()?.errorText));
  await page.route("**/*", route => {
    if (!route.request().url().includes("esm.sh")) return route.continue();
    return route.fulfill({
    status: 200,
    contentType: "application/javascript",
    body: "export const createClient = () => ({ auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) } });"
    });
  });

  await page.goto("http://127.0.0.1:4173/livelihood-learning-center/", {
    waitUntil: "domcontentloaded",
    timeout: 30000
  });
  await page.waitForSelector("#auth-section:not(.hidden)", { timeout: 30000 });
  try {
    await page.waitForFunction(() => document.documentElement.dataset.lvcReady === "true", { timeout: 10000 });
  } catch (error) {
    throw new Error("LMS JavaScript did not initialize. Browser errors: " + errors.join(" | ") + " | window errors: " + JSON.stringify(await page.evaluate(() => window.__lvcBrowserErrors || [])));
  }

  if (!(await page.title()).includes("Livelihood Learning Center")) {
    throw new Error("Unexpected page title.");
  }
  for (const id of ["#learner-section", "#trainer-section", "#admin-section", "#pending-section"]) {
    if (await page.locator(id).isVisible()) {
      throw new Error("Protected workspace visible without authentication: " + id);
    }
  }

  const initialLanguageLabel = await page.locator("#lang-toggle").innerText();
  await page.locator("#lang-toggle").click();
  const switchedLanguageLabel = await page.locator("#lang-toggle").innerText();
  if (initialLanguageLabel === switchedLanguageLabel) {
    throw new Error("Language toggle did not switch its language label.");
  }
  await page.locator("#lang-toggle").click();
  if ((await page.locator("#lang-toggle").innerText()) !== initialLanguageLabel) {
    throw new Error("Language toggle did not switch back to its original language.");
  }

  await page.locator("#signup-tab").click();
  if (!(await page.locator("#name-field").isVisible())) {
    throw new Error("Sign-up mode did not reveal the full-name field.");
  }
  if (!(await page.locator("#signup-role-field").isVisible())) {
    throw new Error("Sign-up mode did not reveal the account-type selector.");
  }
  const roleOptions = await page.locator("#signup-role option").evaluateAll(options => options.map(option => option.value));
  if (roleOptions.join(",") !== "learner,trainer") {
    throw new Error("Sign-up role selector must offer Learner and Trainer.");
  }
  if ((await page.locator("#auth-submit").innerText()).trim().length === 0) {
    throw new Error("Sign-up submit button has no label.");
  }

  await page.locator("#login-tab").click();
  if (await page.locator("#name-field").isVisible()) {
    throw new Error("Login mode did not hide the full-name field.");
  }
  if (await page.locator("#signup-role-field").isVisible()) {
    throw new Error("Login mode did not hide the account-type selector.");
  }

  if (errors.length) {
    throw new Error("Browser runtime errors: " + errors.join(" | "));
  }
  console.log("Browser smoke test passed: initial auth view, protected-workspace visibility, bilingual toggle and sign-up/login mode.");
} finally {
  await browser.close();
}
