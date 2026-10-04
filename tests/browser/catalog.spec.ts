import { test, expect } from "@playwright/test";

test("syllabus overview opens theme outlines and the existing rights graph", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#/gs2/polity");
  await expect(
    page.getByRole("heading", { name: "Polity syllabus map" }),
  ).toBeVisible();
  await expect(page.locator(".map-card")).toHaveCount(10);
  await expect(page.locator(".react-flow__edge")).toHaveCount(9);
  await page.waitForTimeout(350);
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-polity-overview.png`,
    fullPage: true,
  });
  if (test.info().project.name === "desktop") {
    await page
      .getByRole("button", {
        name: "Federalism & local government",
        exact: true,
      })
      .hover();
    await expect(page.locator(".map-card:not(.dimmed)")).toHaveCount(2);
    await page.mouse.move(5, 5);
  }
  await page
    .getByRole("button", { name: "01 · Constitution & its foundations" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Constitution & its foundations",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Mapped themes/ }),
  ).toBeVisible();
  await expect(
    page.getByText(/of \d+ home themes have study maps/),
  ).toBeVisible();
  await expect(page.getByText(/Home themes ·/)).toBeVisible();
  await expect(page.getByText(/Related themes ·/)).toBeVisible();
  await page
    .getByRole("button", { name: /^Fundamental Duties 0 Mains/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Fundamental Duties", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Editorial revision placement", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open Fundamental Duties map" })
    .click();
  await expect(page.locator('[data-concept="a51A-k"]')).toHaveCount(1);
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
    .getByRole("region", { name: "Theme search results" })
    .getByRole("button", {
      name: "Fundamental Rights Polity · 7 Mains · 7 Prelims",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Existing PYQ mapping", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-polity-theme.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Open Fundamental Rights graph" })
    .click();
  await expect(page.locator(".concept-card")).toHaveCount(47);
  await expect(
    page.getByRole("heading", { name: "Six rights categories" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Polity", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Polity syllabus map" }),
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
  await expect(page.locator(".map-card")).toHaveCount(3);
  await expect(
    page.getByText("These are not additional official Mains syllabus bullets."),
  ).toBeVisible();
  await page.goto("/#/gs2/polity/topics/not-a-topic");
  await expect(
    page.getByRole("heading", { name: "Topic not found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to Polity" }).click();
  await expect(
    page.getByRole("heading", { name: "Polity syllabus map" }),
  ).toBeVisible();
  await page.goto("/#/gs2/polity?node=a21");
  await expect(
    page.getByRole("heading", { name: "Article 21", exact: true }),
  ).toBeVisible();
});
