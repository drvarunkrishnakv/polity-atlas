import { test, expect } from "@playwright/test";

test("authored theme card opens directly while an unfinished theme remains an outline", async ({
  page,
}) => {
  await page.goto("/#/gs2/polity/topics/constitution");
  await expect(page.locator(".map-card")).toHaveCount(50);
  const card = page.getByRole("button", {
    name: "Fundamental Rights",
    exact: true,
  });
  await card.focus();
  await card.press("Enter");
  await expect(page.locator(".concept-card")).toHaveCount(47);
  await expect(
    page.getByRole("button", { name: /Reveal|^Open .*map/ }),
  ).toHaveCount(0);
  await page.goBack();
  await expect(page.locator(".map-card")).toHaveCount(50);
  const unfinished = page.getByRole("button", {
    name: "Federalism",
    exact: true,
  });
  await unfinished.focus();
  await unfinished.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Federalism", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".concept-card[data-concept]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Open / })).toHaveCount(0);
});

test("saved combined-canvas bookmarks migrate to focused maps and keep the selected Article", async ({
  page,
}) => {
  await page.goto(
    "/#/gs2/polity/topics/constitution?theme=microtheme%3A1d65764b992c6badc9fb36b4",
  );
  await expect(page).toHaveURL(/\/study\/constitutional-values$/);
  await expect(page.locator(".concept-card")).toHaveCount(13);
  await page.goto(
    "/#/gs2/polity/topics/constitution?focus=fundamental-rights&node=a31C",
  );
  await expect(page).toHaveURL(/\/fundamental-rights\?node=a31C$/);
  await expect(
    page.getByRole("heading", { name: "Article 31C", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".concept-card")).toHaveCount(47);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Article 31C", exact: true }),
  ).toBeVisible();
});

test("sourced links switch focused maps at the shared Article and back", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#/gs2/polity/fundamental-rights?node=a31C");
  let related = page.getByRole("region", { name: "Related study maps" });
  await expect(
    related.getByText(/Although directives are non-justiciable/),
  ).toBeVisible();
  await related
    .getByRole("button", { name: "Directive Principles", exact: true })
    .click();
  await expect(page).toHaveURL(/\/study\/directive-principles\?node=a31C$/);
  await expect(page.locator(".concept-card")).toHaveCount(28);
  await expect(page.locator('[data-concept="puttaswamy"]')).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Article 31C", exact: true }),
  ).toBeVisible();
  related = page.getByRole("region", { name: "Related study maps" });
  await related
    .getByRole("button", { name: "Fundamental Rights", exact: true })
    .click();
  await expect(page.locator(".concept-card")).toHaveCount(47);
  await page.goBack();
  await expect(page.locator(".concept-card")).toHaveCount(28);
  expect(errors).toEqual([]);
});

test("focused map screenshots and responsive bounds", async ({ page }) => {
  await page.goto("/#/gs2/polity/fundamental-rights");
  await expect(
    page.getByRole("heading", { name: "Six rights categories" }),
  ).toBeVisible();
  await page.waitForTimeout(450);
  await page.screenshot({
    path: `output/qa/focused-${test.info().project.name}-dark.png`,
    fullPage: true,
  });
  await page.goto("/#/gs2/polity/study/constitutional-values");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator(".concept-card")).toHaveCount(13);
  await page.waitForTimeout(450);
  const canvas = await page.locator(".react-flow").boundingBox();
  const cards = await page.locator(".concept-card").evaluateAll((nodes) =>
    nodes.map((node) => {
      const r = node.getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }),
  );
  expect(canvas).not.toBeNull();
  const visible = cards.filter(
    (r) =>
      r.x >= canvas!.x - 2 &&
      r.y >= canvas!.y - 2 &&
      r.right <= canvas!.x + canvas!.width + 2 &&
      r.bottom <= canvas!.y + canvas!.height + 2,
  );
  // The opening view must show the organising structure, not just the root.
  expect(visible.length).toBeGreaterThanOrEqual(6);
  await page.screenshot({
    path: `output/qa/focused-${test.info().project.name}-light.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
