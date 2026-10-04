import { test, expect } from "@playwright/test";
const path = "/#/gs2/polity/topics/constitution";
test("saved theme opens connections inline; focus and selection retain the full topic", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${path}?theme=microtheme%3A1d65764b992c6badc9fb36b4`);
  const inspector = page.getByTestId("inspector");
  await expect(
    inspector.getByRole("heading", {
      name: "Constitutional values",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".concept-card")).toHaveCount(260);
  await expect(page.locator(".react-flow__edge")).toHaveCount(419);
  await expect(
    page.getByRole("button", { name: /^Open .* (map|graph)$/ }),
  ).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Explore theme" })
    .selectOption("fundamental-rights");
  await expect(
    inspector.getByRole("heading", { name: "Fundamental Rights", exact: true }),
  ).toBeVisible();
  const search = page.getByRole("textbox", { name: "Search concepts" });
  await search.fill("Puttaswamy");
  await page
    .getByRole("region", { name: "Search results" })
    .getByRole("button")
    .click();
  await expect(
    inspector.getByRole("heading", { name: "Puttaswamy (2017)", exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-concept="privacy"]')).not.toHaveClass(
    /dimmed/,
  );
  await expect(page.locator('[data-concept="fr"]')).toHaveClass(/dimmed/);
  await page.reload();
  await expect(
    inspector.getByRole("heading", { name: "Puttaswamy (2017)", exact: true }),
  ).toBeVisible();
  expect(page.url()).toContain("/topics/constitution");
  await expect(
    page.getByRole("combobox", { name: "Explore theme" }),
  ).toHaveValue("fundamental-rights");
  await page
    .getByRole("combobox", { name: "Explore theme" })
    .selectOption("constitutional-values");
  await page.waitForTimeout(600);
  await page.screenshot({
    path: `output/qa/inline-topic-${test.info().project.name}-dark.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.screenshot({
    path: `output/qa/inline-topic-${test.info().project.name}-light.png`,
    fullPage: true,
  });
  await expect(page.locator(".concept-card")).toHaveCount(260);
  await expect(page.locator(".react-flow__edge")).toHaveCount(419);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("inline hover keeps card bounds, camera and pinned inspector stable", async ({
  page,
}) => {
  test.skip(test.info().project.name !== "desktop", "Mouse hover");
  await page.goto(`${path}?theme=microtheme%3A1d65764b992c6badc9fb36b4`);
  const card = page.locator('[data-concept="value-equality"]');
  await expect(card).toBeInViewport();
  await page.waitForTimeout(600);
  const box = await card.boundingBox();
  const viewport = page.locator(".react-flow__viewport");
  const transform = await viewport.getAttribute("style");
  await card.hover();
  for (let i = 0; i < 12; i++) {
    await expect(card).toHaveClass(/active/);
    await expect(page.locator('[data-concept="a14"]')).not.toHaveClass(
      /dimmed/,
    );
    await expect(page.locator('[data-concept="privacy"]')).toHaveClass(
      /dimmed/,
    );
    expect(await card.boundingBox()).toEqual(box);
    await page.evaluate(() => new Promise(requestAnimationFrame));
  }
  expect(await viewport.getAttribute("style")).toBe(transform);
  await expect(
    page
      .getByTestId("inspector")
      .getByRole("heading", { name: "Constitutional values", exact: true }),
  ).toBeVisible();
});

test("topic index focuses the same canvas and full fit includes all cards", async ({
  page,
}) => {
  await page.goto(path);
  await page.getByRole("button", { name: "Topic index" }).click();
  await page
    .locator(".topic-index")
    .getByRole("button", {
      name: "Fundamental Rights",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Explore theme" }),
  ).toHaveValue("fundamental-rights");
  expect(page.url()).toContain("/topics/constitution");
  await page.getByRole("button", { name: "Fit graph", exact: true }).click();
  await page.waitForTimeout(400);
  const fitted = await page.evaluate(() => {
    const viewport = document
      .querySelector(".graph-viewport")!
      .getBoundingClientRect();
    return [...document.querySelectorAll(".concept-card")].every((card) => {
      const box = card.getBoundingClientRect();
      return (
        box.left >= viewport.left - 2 &&
        box.right <= viewport.right + 2 &&
        box.top >= viewport.top - 2 &&
        box.bottom <= viewport.bottom + 2
      );
    });
  });
  expect(fitted).toBe(true);
});
