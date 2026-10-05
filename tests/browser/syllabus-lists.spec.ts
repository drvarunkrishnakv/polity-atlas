import { test, expect } from "@playwright/test";

test("grouped topic lists preserve all identities and open graphs directly", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#/gs2/polity/topics/constitution");
  await expect(page.locator(".theme-row")).toHaveCount(49);
  await expect(page.locator(".react-flow")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /Fit map|Zoom in|Zoom out/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Related themes" }).locator(".theme-row"),
  ).toHaveCount(11);
  const rows = await page
    .locator(".theme-row")
    .evaluateAll((els) => els.map((el) => el.getAttribute("data-theme-id")));
  expect(new Set(rows).size).toBe(49);
  const search = page.getByRole("textbox", { name: "Search Polity themes" });
  await search.fill("Fundamental Rights");
  const fr = page.getByRole("button", {
    name: "Fundamental Rights",
    exact: true,
  });
  await fr.focus();
  await fr.press("Enter");
  await expect(page.locator(".concept-card")).toHaveCount(47);
  await page.goBack();
  await expect(search).toHaveValue("Fundamental Rights");
  await expect(fr).toBeFocused();
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Theme groups" })
    .getByRole("button", { name: "Rights and remedies" })
    .click();
  const scroll = await page
    .locator(".syllabus-scroll")
    .evaluate((el) => el.scrollTop);
  expect(scroll).toBeGreaterThan(200);
  await fr.click();
  await expect(page.locator(".concept-card")).toHaveCount(47);
  await page
    .getByRole("button", {
      name: "Constitution & its foundations",
      exact: true,
    })
    .click();
  await expect(page.locator(".theme-row")).toHaveCount(49);
  await expect
    .poll(async () =>
      Math.abs(
        (await page
          .locator(".syllabus-scroll")
          .evaluate((el) => el.scrollTop)) - scroll,
      ),
    )
    .toBeLessThanOrEqual(2);
  await page.reload();
  await expect
    .poll(async () =>
      Math.abs(
        (await page
          .locator(".syllabus-scroll")
          .evaluate((el) => el.scrollTop)) - scroll,
      ),
    )
    .toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
});

test("list search scope, unavailable themes and provenance remain clear", async ({
  page,
}) => {
  await page.goto("/#/gs2/polity/topics/constitution");
  const search = page.getByRole("textbox", { name: "Search Polity themes" });
  await search.fill("zz-no-theme");
  await expect(
    page.getByRole("heading", { name: "No matching themes" }),
  ).toBeVisible();
  await search.fill("Federalism");
  await page.getByRole("button", { name: "Federalism", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Federalism", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/Outline only. Detailed provisions/),
  ).toBeVisible();
  await expect(page.getByText("Existing PYQ mapping").first()).toBeVisible();
  await expect(page.locator(".react-flow")).toHaveCount(0);
  await page.getByRole("button", { name: "Back to topic themes" }).click();
  await expect(search).toHaveValue("Federalism");
  await search.fill("Scheduled areas");
  await expect(page.locator(".theme-row")).toHaveCount(2);
  await page.getByRole("button", { name: "Polity", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Polity syllabus", exact: true }),
  ).toBeVisible();
  await search.fill("Federalism");
  await expect(
    page.getByRole("region", { name: "Theme search results" }),
  ).toBeVisible();
});

test("list screenshots in both appearances", async ({ page }) => {
  await page.goto("/#/gs2/polity/topics/constitution");
  await expect(page.locator(".theme-row")).toHaveCount(49);
  for (const mode of ["dark", "light"]) {
    if (mode === "light")
      await page.getByRole("button", { name: "Switch to light mode" }).click();
    await page.screenshot({
      path: `output/qa/lists-${test.info().project.name}-${mode}.png`,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("blocked storage still restores list state within the session", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.goto("/#/gs2/polity/topics/constitution");
  const search = page.getByRole("textbox", { name: "Search Polity themes" });
  await search.fill("Fundamental Rights");
  await page
    .getByRole("button", { name: "Fundamental Rights", exact: true })
    .click();
  await expect(page.locator(".concept-card")).toHaveCount(47);
  await page.goBack();
  await expect(search).toHaveValue("Fundamental Rights");
  await search.press("Escape");
  await page.getByRole("button", { name: "All topics", exact: true }).click();
  await page
    .getByRole("button", { name: "01 · Constitution & its foundations" })
    .click();
  await expect(search).toHaveValue("");
  await expect(page.locator(".theme-row")).toHaveCount(49);
});
