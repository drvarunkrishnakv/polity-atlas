import { test, expect } from "@playwright/test";

test("six categories lead to Articles and coloured judgments without disclosure", async ({
  page,
}) => {
  await page.goto("/#/gs2/polity/fundamental-rights");
  await expect(page.locator(".concept-card.kind-category")).toHaveCount(6);
  await expect(page.locator(".concept-card")).toHaveCount(47);
  await expect(page.locator(".react-flow__edge")).toHaveCount(52);
  await expect(
    page.getByRole("heading", { name: "Six rights categories", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".concept-card.kind-article:not(.dimmed)"),
  ).toHaveCount(0);
  await expect(page.locator('[data-region="supporting"]')).toHaveCount(1);
  await expect(page.locator('[data-region="historical"]')).toHaveCount(1);
  await expect(page.locator('[data-concept="a31"] .node-type')).toHaveText(
    "Article · omitted",
  );
  const colours = await page.evaluate(() =>
    ["right-freedom", "a21", "puttaswamy", "privacy", "disclosure"].map(
      (id) =>
        getComputedStyle(document.querySelector(`[data-concept="${id}"]`)!)
          .backgroundColor,
    ),
  );
  expect(new Set(colours).size).toBe(5);
  await page.waitForTimeout(400);
  if (test.info().project.name === "desktop") {
    for (const node of await page.locator(".concept-card.kind-category").all())
      await expect(node).toBeInViewport();
    await page.locator('[data-concept="right-freedom"]').hover();
    await expect(page.getByTestId("highlight-status")).toContainText(
      "Hover preview: Right to Freedom",
    );
    await expect(page.getByTestId("highlight-status")).toContainText(
      "Details pinned to Fundamental Rights",
    );
    await expect(
      page.getByRole("heading", { name: "Fundamental Rights", exact: true }),
    ).toBeVisible();
    await page.mouse.move(5, 5);
  }
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-six-categories.png`,
    fullPage: true,
  });
  await page
    .getByTestId("inspector")
    .getByRole("button", { name: "Right to Freedom category", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Right to Freedom", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".concept-card.kind-article:not(.dimmed)"),
  ).toHaveCount(5);
  await expect(page.locator('[data-concept="a14"]')).toHaveClass(/dimmed/);
  await expect(page.locator('[data-concept="puttaswamy"]')).toHaveClass(
    /dimmed/,
  );
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-freedom-articles.png`,
    fullPage: true,
  });
  await page.locator('[data-concept="a21"]').click();
  await expect(
    page.getByRole("heading", { name: "Article 21", exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-concept="puttaswamy"]')).not.toHaveClass(
    /dimmed/,
  );
  await expect(page.locator('[data-concept="privacy"]')).toHaveClass(/dimmed/);
  await expect(page.getByRole("button", { name: /Reveal/ })).toHaveCount(0);
  await expect(page.locator(".concept-card")).toHaveCount(47);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(
    page.locator(".concept-card.kind-article:not(.dimmed)"),
  ).toHaveCount(0);
});
