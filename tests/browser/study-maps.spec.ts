import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

const bank = JSON.parse(
  readFileSync(
    new URL("../../apps/web/src/content/foundations.json", import.meta.url),
    "utf8",
  ),
) as {
  sourceCutoff: string;
  maps: {
    slug: string;
    rootId: string;
    nodeIds: string[];
    edgeIds: string[];
  }[];
};

test("an unknown constitution study slug recovers without the rights graph", async ({
  page,
}) => {
  const urls: string[] = [];
  page.on("request", (request) => urls.push(request.url()));
  await page.goto("/#/gs2/polity/study/not-a-reviewed-map");
  await expect(
    page.getByRole("heading", { name: "Study map unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByText("This study map is not in the reviewed release."),
  ).toBeVisible();
  const seen = urls.join("\n");
  expect(seen).toContain("foundations.json");
  expect(seen).toContain("FoundationScreen");
  expect(seen).not.toContain("fundamental-rights.json");
  expect(seen).not.toContain("polity-catalog.json");
  await page.getByRole("button", { name: "Back to Constitution" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Constitution & its foundations",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/#/gs2/polity/study/not-a-reviewed-map");
  await page.getByRole("button", { name: "Back to library" }).click();
  await expect(
    page.getByRole("heading", { name: "Start with a paper." }),
  ).toBeVisible();
});

test("reviewed foundation maps render in full when the bank has them", async ({
  page,
}) => {
  test.skip(bank.maps.length === 0, "No reviewed maps in this release yet");
  const [first, second] = bank.maps;
  await page.goto(`/#/gs2/polity/study/${first.slug}`);
  await expect(page.locator(".concept-card")).toHaveCount(first.nodeIds.length);
  await expect(page.locator(".react-flow__edge")).toHaveCount(
    first.edgeIds.length,
  );
  await expect(page.getByRole("button", { name: /Reveal/ })).toHaveCount(0);
  await expect(page.getByText(bank.sourceCutoff)).toBeVisible();
  await expect(page.getByText("Rights categories")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Constitution & its foundations" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Constitution & its foundations",
      exact: true,
    }),
  ).toBeVisible();
  if (!second) return;
  await page.goto(`/#/gs2/polity/study/${first.slug}?node=${first.rootId}`);
  await page.goto(`/#/gs2/polity/study/${second.slug}`);
  await expect(page.locator(".concept-card")).toHaveCount(
    second.nodeIds.length,
  );
  expect(page.url()).toContain(`/study/${second.slug}`);
  expect(page.url()).not.toContain(first.rootId);
});

test("every authored map opens with its complete graph on each device", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const map of bank.maps) {
    await page.goto(`/#/gs2/polity/study/${map.slug}`);
    await expect(page.locator(".concept-card"), map.slug).toHaveCount(
      map.nodeIds.length,
    );
    await expect(page.locator(".react-flow__edge"), map.slug).toHaveCount(
      map.edgeIds.length,
    );
    await expect(page.locator(".concept-card.active")).toHaveAttribute(
      "data-concept",
      map.rootId,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      map.slug,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("duty clauses, bookmarks, colours and reset retain the full map", async ({
  page,
}) => {
  const map = bank.maps.find((item) => item.slug === "fundamental-duties")!;
  await page.goto("/#/gs2/polity/study/fundamental-duties?node=a51A-k");
  const inspector = page.getByTestId("inspector");
  await expect(
    inspector.getByRole("heading", { name: "Article 51A(k)", exact: true }),
  ).toBeVisible();
  await expect(
    inspector.getByText("Article clause", { exact: true }),
  ).toBeVisible();
  const article = page.locator('[data-concept="a51A-k"]');
  await expect(article).toHaveClass(/kind-article/);
  await page.reload();
  await expect(
    inspector.getByRole("heading", { name: "Article 51A(k)", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator(".concept-card")).toHaveCount(map.nodeIds.length);
  await expect(page.locator(".react-flow__edge")).toHaveCount(
    map.edgeIds.length,
  );
  await expect(page.locator(".concept-card.active")).toHaveAttribute(
    "data-concept",
    map.rootId,
  );
});

test("new map hover is bounded, stable and independent of pinned details", async ({
  page,
}) => {
  test.skip(test.info().project.name !== "desktop", "Mouse-only interaction");
  await page.goto("/#/gs2/polity/study/directive-principles");
  const card = page.locator('[data-concept="cat-dpsp-social"]');
  await expect(card).toBeVisible();
  await page.waitForTimeout(600);
  const before = await card.boundingBox();
  await card.hover();
  const viewport = page.locator(".react-flow__viewport");
  const transform = await viewport.getAttribute("style");
  for (let frame = 0; frame < 12; frame++) {
    await expect(card).toHaveClass(/active/);
    await expect(page.locator('[data-concept="a39"]')).not.toHaveClass(
      /dimmed/,
    );
    await expect(page.locator('[data-concept="property-owners"]')).toHaveClass(
      /dimmed/,
    );
    expect(await card.boundingBox()).toEqual(before);
    await page.evaluate(() => new Promise(requestAnimationFrame));
  }
  await expect(
    page
      .getByTestId("inspector")
      .getByRole("heading", { name: "Directive Principles", exact: true }),
  ).toBeVisible();
  expect(await viewport.getAttribute("style")).toBe(transform);
});

test("foundation maps remain readable in dark and light responsive layouts", async ({
  page,
}) => {
  const profile = test.info().project.name;
  await page.goto("/#/gs2/polity/study/directive-principles");
  await expect(page.locator('[data-concept="theme:dpsp"]')).toBeVisible();
  const resetBox = await page
    .getByRole("button", { name: "Reset", exact: true })
    .boundingBox();
  expect(resetBox!.x + resetBox!.width).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  await page.waitForTimeout(450);
  await page.screenshot({
    path: `output/qa/foundations-${profile}-dark.png`,
    fullPage: true,
  });
  await page.goto("/#/gs2/polity/study/fundamental-duties?node=a51A-k");
  await expect(
    page
      .getByTestId("inspector")
      .getByRole("heading", { name: "Article 51A(k)", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.waitForTimeout(450);
  await page.screenshot({
    path: `output/qa/foundations-${profile}-light.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
