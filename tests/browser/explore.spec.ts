import { resolve } from "node:path";
import { test, expect } from "@playwright/test";
test("paper to subject to graph; all concepts, select and reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: /GS II Polity/ }).click();
  await page
    .getByRole("button", { name: /Polity Indian Constitution/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Fundamental Rights", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search concepts" })
    .fill("Article 21");
  await page
    .getByRole("region", { name: "Search results" })
    .getByRole("button", {
      name: "Article 21 Life and personal liberty",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Article 21", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Reveal/ })).toHaveCount(0);
  await expect(page.locator('[data-concept="puttaswamy"]')).toBeVisible();
  await expect(page.locator('[data-concept="privacy"]')).toHaveCount(1);
  await expect(page.locator(".concept-card")).toHaveCount(41);
  await expect(page.locator(".react-flow__edge")).toHaveCount(46);
  await page
    .getByRole("textbox", { name: "Search concepts" })
    .fill("Puttaswamy");
  await page
    .getByRole("region", { name: "Search results" })
    .getByRole("button")
    .click();
  await expect(
    page.getByRole("heading", { name: "Puttaswamy (2017)", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Justice K. S. Puttaswamy (Retd.) and Another v. Union of India and Others",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(
    page.getByRole("heading", { name: "Fundamental Rights", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".concept-card")).toHaveCount(41);
  await expect(page.locator(".react-flow__edge")).toHaveCount(46);
  expect(errors).toEqual([]);
});
test("search empty state, topic index, link explanation and responsive bounds", async ({
  page,
}) => {
  await page.goto("/#/gs2/polity");
  await page
    .getByRole("textbox", { name: "Search concepts" })
    .fill("not-a-concept-xyz");
  await expect(
    page.getByText("No matching concepts.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await page.getByRole("button", { name: "Topic index" }).click();
  await page
    .locator(".topic-index")
    .getByRole("button", {
      name: "Article 31 Property provision · omitted",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Article 31", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Article 31 was omitted by the 44th Amendment.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.locator(".connection summary .why").first().click();
  await expect(page.locator(".connection[open]")).toHaveCount(1);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  expect(overflow).toBe(false);
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-article31.png`,
    fullPage: true,
  });
});
test("direct link route and keyboard search; selection does not flood graph", async ({
  page,
}) => {
  await page.goto("/#/gs2/polity?node=a21");
  await expect(
    page.getByRole("heading", { name: "Article 21", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search concepts" })
    .fill("Article 14");
  await page.getByRole("textbox", { name: "Search concepts" }).press("Enter");
  await expect(
    page.getByRole("heading", { name: "Article 14", exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-concept="a21"]')).toHaveClass(/dimmed/);
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-article14.png`,
    fullPage: true,
  });
});

test("base view, keyboard node activation and inspector persistence", async ({
  page,
}) => {
  await page.goto("/#/gs2/polity");
  await expect(
    page.getByRole("heading", { name: "Fundamental Rights", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-base.png`,
    fullPage: true,
  });
  await page.locator('[data-concept="a21"]').focus();
  await page.locator('[data-concept="a21"]').press("Enter");
  await expect(
    page.getByRole("heading", { name: "Article 21", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Reveal/ })).toHaveCount(0);
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-expanded.png`,
    fullPage: true,
  });
  if (test.info().project.name === "desktop") {
    await page.locator('[data-concept="a14"]').hover();
    await expect(
      page.getByRole("heading", { name: "Article 21", exact: true }),
    ).toBeVisible();
  }
});

test("touch selection and close/reopen details", async ({ page }) => {
  await page.goto("/#/gs2/polity");
  await expect(
    page.getByRole("heading", { name: "Fundamental Rights", exact: true }),
  ).toBeVisible();
  if (test.info().project.name === "desktop") return;
  await page.locator('[data-concept="fr"]').tap();
  await page.getByRole("button", { name: "Close details" }).click();
  await expect(page.getByTestId("inspector")).toHaveCount(0);
  await page.getByRole("button", { name: "Show details" }).click();
  await expect(
    page.getByRole("heading", { name: "Fundamental Rights", exact: true }),
  ).toBeVisible();
});

test("development server cannot expose workspace files outside the app", async ({
  request,
}) => {
  const response = await request.get("/@fs/" + resolve("README.md"));
  expect(response.status()).toBe(403);
  expect(await response.text()).not.toContain("## Product contract");
});

test("privacy chain is present on arrival and framing only moves the camera", async ({
  page,
}) => {
  await page.goto("/#/gs2/polity?node=a21");
  await expect(page.locator(".concept-card")).toHaveCount(41);
  await expect(page.locator(".react-flow__edge")).toHaveCount(46);
  await expect(page.getByRole("button", { name: /Reveal/ })).toHaveCount(0);
  await expect(page.locator('[data-concept="puttaswamy"]')).not.toHaveClass(
    /dimmed/,
  );
  await expect(page.locator('[data-concept="privacy"]')).toHaveClass(/dimmed/);
  await page
    .getByTestId("inspector")
    .getByRole("button", { name: "Puttaswamy (2017) interpreted by" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Puttaswamy (2017)", exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-concept="privacy"]')).not.toHaveClass(
    /dimmed/,
  );
  await page
    .getByRole("button", { name: "Frame connections", exact: true })
    .click();
  await page.waitForTimeout(400);
  for (const id of ["a21", "puttaswamy", "privacy"]) {
    await expect(page.locator(`[data-concept="${id}"]`)).toBeInViewport();
  }
  await expect(page.locator(".concept-card")).toHaveCount(41);
  await expect(page.locator(".react-flow__edge")).toHaveCount(46);
  await page.screenshot({
    path: `output/qa/${test.info().project.name}-privacy-chain.png`,
    fullPage: true,
  });
  await page.locator('[data-concept="privacy"]').click();
  await expect(
    page.getByRole("heading", { name: "Privacy", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator(".concept-card")).toHaveCount(41);
  await expect(page.locator('[data-concept="privacy"]')).toHaveCount(1);
});
