import { test, expect } from "@playwright/test";

test("hover keeps cards and edges visible without losing the pinned inspector", async ({
  page,
}) => {
  test.skip(
    test.info().project.name !== "desktop",
    "Mouse hover requires a mouse profile",
  );
  await page.goto("/#/gs2/polity");
  await expect(page.locator('[data-concept="fr"]')).toBeVisible();
  await page.waitForTimeout(700);
  const edgeCount = await page.locator(".react-flow__edge").count();
  expect(edgeCount).toBeGreaterThan(0);
  // Exercise card centres and all four boundaries, including wrapped titles.
  for (const id of [
    "right-equality",
    "right-freedom",
    "fr",
    "right-religion",
    "right-cultural",
  ]) {
    const node = page.locator(`[data-concept="${id}"]`);
    const box = (await node.boundingBox())!;
    for (const [dx, dy] of [
      [0.5, 0.5],
      [0.5, 0.02],
      [0.5, 0.98],
      [0.02, 0.5],
      [0.98, 0.5],
    ]) {
      await page.mouse.move(box.x + box.width * dx, box.y + box.height * dy);
      const failures = await page.evaluate(
        async ({ id, edgeCount }) => {
          const failures: string[] = [];
          // Inspect every rendered frame: a final-state assertion misses flicker.
          for (let frame = 0; frame < 30; frame++) {
            await new Promise<void>((resolve) =>
              requestAnimationFrame(() => resolve()),
            );
            if (
              document
                .querySelector(".concept-card.active")
                ?.getAttribute("data-concept") !== id
            )
              failures.push(`frame ${frame}: hover lost`);
            if (
              [...document.querySelectorAll(".react-flow__node")].some(
                (node) => getComputedStyle(node).visibility === "hidden",
              )
            )
              failures.push(`frame ${frame}: cards hidden`);
            if (
              document.querySelectorAll(".react-flow__edge").length !==
              edgeCount
            )
              failures.push(`frame ${frame}: edges disappeared`);
          }
          return failures;
        },
        { id, edgeCount },
      );
      expect(failures, `${id} at ${dx},${dy}`).toEqual([]);
      expect(await node.boundingBox()).toEqual(box);
    }
  }
  await expect(
    page.getByRole("heading", { name: "Fundamental Rights", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "output/qa/desktop-hover-fixed.png",
    fullPage: true,
  });
  await page.mouse.move(5, 5);
  await expect(page.locator('[data-concept="fr"]')).toHaveClass(/active/);
  await expect(page.locator('[data-concept="right-cultural"]')).not.toHaveClass(
    /active/,
  );
});
