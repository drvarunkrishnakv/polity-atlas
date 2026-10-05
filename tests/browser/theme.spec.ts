import { test, expect } from "@playwright/test";

test("theme persists across screens and reloads without moving the graph", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const toggle = page.getByRole("button", { name: "Switch to light mode" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-light-library.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: /GS II Polity/ }).click();
  await page
    .getByRole("button", { name: /Polity Indian Constitution/ })
    .click();
  await page
    .getByRole("button", { name: "01 · Constitution & its foundations" })
    .click();
  await page
    .getByRole("button", { name: "Fundamental Rights", exact: true })
    .click();
  await expect(page.locator(".react-flow.light")).toBeVisible();
  await page
    .getByTestId("inspector")
    .getByRole("button", { name: "Right to Freedom category", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Right to Freedom", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(500);
  const viewport = page.locator(".react-flow__viewport").first();
  const transform = await viewport.evaluate((el) => el.getAttribute("style"));
  await expect(page.locator(".concept-card")).toHaveCount(47);
  await expect(page.locator(".react-flow__edge")).toHaveCount(52);
  // Explicit type labels remain readable against every light-mode card tint.
  const contrasts = await page.evaluate(() => {
    const luminance = (colour: string) => {
      const rgb = colour
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number)
        .map((c) => {
          const v = c / 255;
          return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        });
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    return [
      "fr",
      "right-freedom",
      "a21",
      "puttaswamy",
      "privacy",
      "disclosure",
    ].map((id) => {
      const card = document.querySelector(`[data-concept="${id}"]`)!;
      const bg = luminance(getComputedStyle(card).backgroundColor);
      const fg = luminance(
        getComputedStyle(card.querySelector(".node-type")!).color,
      );
      return (Math.max(bg, fg) + 0.05) / (Math.min(bg, fg) + 0.05);
    });
  });
  for (const contrast of contrasts)
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-light-graph.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator(".react-flow.dark")).toBeVisible();
  expect(await viewport.evaluate((el) => el.getAttribute("style"))).toBe(
    transform,
  );
  await expect(
    page.getByRole("heading", { name: "Right to Freedom", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-dark-graph.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(
    page.getByRole("heading", { name: "Right to Freedom", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Polity Atlas", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Start with a paper." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Switch to dark mode" }),
  ).toBeVisible();
});

test("theme still switches when persistent storage is unavailable", async ({
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
  await page.goto("/#/gs2/polity/fundamental-rights?node=a21");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(
    page.getByRole("heading", { name: "Article 21", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
