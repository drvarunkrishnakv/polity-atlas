import { test, expect, type Page } from "@playwright/test";

function watch(page: Page) {
  const urls: string[] = [];
  page.on("request", (request) => urls.push(request.url()));
  return urls;
}
const joined = (urls: string[]) => urls.join("\n");

/** Hold matching module requests, then resolve once every held response arrives. */
function stall(page: Page, marker: string) {
  let open = false;
  let releaseGate = () => {};
  const gate = new Promise<void>((resolve) => {
    releaseGate = () => {
      if (open) return;
      open = true;
      resolve();
    };
  });
  let pending = 0;
  let arrived = 0;
  let needed = 0;
  let resolveSettled = () => {};
  const settled = new Promise<void>((resolve) => {
    resolveSettled = resolve;
  });
  const consider = () => {
    if (needed > 0 && arrived >= needed) resolveSettled();
  };
  page.on("response", (response) => {
    if (!response.url().includes(marker)) return;
    arrived += 1;
    consider();
  });
  return {
    install: () =>
      page.route(new RegExp(marker), async (route) => {
        pending += 1;
        await gate;
        await route.continue();
      }),
    release: () => {
      needed = pending;
      if (needed === 0)
        throw new Error(`No stalled ${marker} request was intercepted`);
      releaseGate();
      if (arrived >= needed) resolveSettled();
      return settled;
    },
  };
}

test("home and GS II do not download graph screens or datasets", async ({
  page,
}) => {
  const urls = watch(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Start with a paper." }),
  ).toBeVisible();
  await page.getByRole("button", { name: /GS II Polity/ }).click();
  await expect(
    page.getByRole("heading", { name: "General Studies II" }),
  ).toBeVisible();
  const seen = joined(urls);
  for (const marker of [
    "StudyScreen",
    "OverviewScreen",
    "GraphCanvas",
    "PolityOverview",
    "fundamental-rights.json",
    "polity-catalog.json",
    "xyflow",
  ])
    expect(seen, marker).not.toContain(marker);
});

test("overview loads the catalogue and not the study graph", async ({
  page,
}) => {
  const urls = watch(page);
  await page.goto("/#/gs2/polity");
  await expect(
    page.getByRole("heading", { name: "Polity syllabus map" }),
  ).toBeVisible();
  await expect(page.locator(".map-card")).toHaveCount(10);
  const seen = joined(urls);
  expect(seen).toContain("OverviewScreen");
  expect(seen).toContain("polity-catalog.json");
  expect(seen).toContain("xyflow");
  expect(seen).not.toContain("StudyScreen");
  expect(seen).not.toContain("fundamental-rights.json");
  expect(seen).not.toContain("GraphCanvas");
});

test("canonical and legacy study links load the graph and not the catalogue", async ({
  page,
}) => {
  const urls = watch(page);
  await page.goto("/#/gs2/polity/fundamental-rights");
  await expect(page.locator(".concept-card")).toHaveCount(47);
  await expect(page.locator(".react-flow__edge")).toHaveCount(52);
  let seen = joined(urls);
  expect(seen).toContain("StudyScreen");
  expect(seen).toContain("fundamental-rights.json");
  expect(seen).toContain("xyflow");
  expect(seen).not.toContain("OverviewScreen");
  expect(seen).not.toContain("polity-catalog.json");
  expect(seen).not.toContain("PolityOverview");
  await page.reload();
  await expect(page.locator(".concept-card")).toHaveCount(47);
  await expect(page.locator(".react-flow__edge")).toHaveCount(52);

  const legacy = await page.context().newPage();
  const legacyUrls = watch(legacy);
  await legacy.goto("/#/gs2/polity?node=a21");
  await expect(
    legacy.getByRole("heading", { name: "Article 21", exact: true }),
  ).toBeVisible();
  await expect(legacy.locator(".concept-card")).toHaveCount(47);
  await expect(legacy.locator(".react-flow__edge")).toHaveCount(52);
  seen = joined(legacyUrls);
  expect(seen).toContain("fundamental-rights.json");
  expect(seen).not.toContain("polity-catalog.json");
  expect(seen).not.toContain("OverviewScreen");
  await legacy.reload();
  await expect(
    legacy.getByRole("heading", { name: "Article 21", exact: true }),
  ).toBeVisible();
  await expect(legacy.locator(".concept-card")).toHaveCount(47);
  await expect(legacy.locator(".react-flow__edge")).toHaveCount(52);
  await legacy.close();
});

test("failed study import can reload or return to the library", async ({
  page,
}) => {
  let fail = true;
  await page.route(/StudyScreen/, (route) =>
    fail ? route.abort("failed") : route.continue(),
  );
  await page.goto("/#/gs2/polity/fundamental-rights");
  await expect(
    page.getByRole("heading", { name: "Study map unavailable" }),
  ).toBeVisible();
  const alert = page.getByRole("alert");
  await expect(alert).toContainText(/could not be loaded/i);
  await expect(alert).not.toContainText(/https?:\/\//);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Back to library" }).click();
  await expect(
    page.getByRole("heading", { name: "Start with a paper." }),
  ).toBeVisible();
  await page.getByRole("button", { name: /GS II Polity/ }).click();
  await expect(
    page.getByRole("heading", { name: "General Studies II" }),
  ).toBeVisible();

  await page.goto("/#/gs2/polity/fundamental-rights");
  await expect(
    page.getByRole("heading", { name: "Study map unavailable" }),
  ).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Reload" }).click();
  await expect(
    page.getByRole("heading", { name: "Fundamental Rights", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".concept-card")).toHaveCount(47);
});

test("back to the library during a slow import is not replaced later", async ({
  page,
}) => {
  const held = stall(page, "StudyScreen");
  await held.install();
  try {
    await page.goto("/#/gs2/polity/fundamental-rights");
    await expect(page.getByText("Loading your atlas…")).toBeVisible();
    await page.getByRole("button", { name: "Back to library" }).click();
    await expect(
      page.getByRole("heading", { name: "Start with a paper." }),
    ).toBeVisible();
    await held.release();
    await expect(
      page.getByRole("heading", { name: "Start with a paper." }),
    ).toBeVisible();
    await expect(page.locator(".concept-card")).toHaveCount(0);
  } finally {
    held.release();
  }
});

test("a finished overview import does not replace a newer study route", async ({
  page,
}) => {
  const held = stall(page, "OverviewScreen");
  await held.install();
  try {
    await page.goto("/#/gs2/polity");
    await expect(page.getByText("Loading your atlas…")).toBeVisible();
    await page.evaluate(() => {
      location.hash = "/gs2/polity/fundamental-rights";
    });
    await expect(
      page.getByRole("heading", { name: "Fundamental Rights", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".concept-card")).toHaveCount(47);
    await held.release();
    await expect(
      page.getByRole("heading", { name: "Fundamental Rights", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Polity syllabus map" }),
    ).toHaveCount(0);
  } finally {
    held.release();
  }
});
