import { test, expect } from "@playwright/test";

test("syllabus overview opens theme outlines and the existing rights graph", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#/gs2/polity");
  await expect(
    page.getByRole("heading", { name: "Polity syllabus" }),
  ).toBeVisible();
  await expect(page.locator(".topic-row")).toHaveCount(9);
  await expect(page.locator(".react-flow")).toHaveCount(0);
  await page.waitForTimeout(350);
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-polity-overview.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "01 · Constitution & its foundations" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Constitution & its foundations",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Fundamental Duties", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Fundamental Duties", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".concept-card")).toHaveCount(20);
  await expect(
    page.getByRole("button", { name: /^Open .* (map|graph)$/ }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Constitution & its foundations",
      exact: true,
    })
    .click();
  await page
    .getByRole("textbox", { name: "Search Polity themes" })
    .fill("Fundamental Rights");
  await page
    .getByRole("button", {
      name: "Fundamental Rights",
      exact: true,
    })
    .click();
  await expect(page.locator(".concept-card")).toHaveCount(47);
  await expect(page.locator(".react-flow__edge")).toHaveCount(52);
  expect(page.url()).toContain("/fundamental-rights");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-polity-theme.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Polity", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Polity syllabus" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("deep links, browser history and supporting context preserve theme identities", async ({
  page,
}) => {
  await page.goto("/#/gs2/polity/topics/federalism");
  const search = page.getByRole("textbox", { name: "Search Polity themes" });
  await search.fill("Federalism");
  await search.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Asymmetric federalism", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Asymmetric federalism", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to topic themes" }).click();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Asymmetric federalism", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Polity", exact: true }).click();
  await page
    .getByRole("button", { name: "Prelims context · 2 themes" })
    .click();
  await expect(page.locator(".theme-row")).toHaveCount(2);
  await page
    .getByText("Revision structure & syllabus placement", { exact: true })
    .click();
  await expect(
    page.getByText("These are not additional official Mains syllabus bullets."),
  ).toBeVisible();
  await page.goto("/#/gs2/polity/topics/not-a-topic");
  await expect(
    page.getByRole("heading", { name: "Topic not found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to Polity" }).click();
  await expect(
    page.getByRole("heading", { name: "Polity syllabus" }),
  ).toBeVisible();
  await page.goto("/#/gs2/polity?node=a21");
  await expect(
    page.getByRole("heading", { name: "Article 21", exact: true }),
  ).toBeVisible();
});
