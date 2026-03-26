import { test, expect } from "../../fixtures/base.fixtures";

test.describe("Product - Search", () => {
  test("Search for existing product", async ({ productListPage }) => {
    await productListPage.gotoSearch("iphone 16");
    await expect(productListPage.productCards).not.toHaveCount(0);
  });

  test("Search for nonexistent product", async ({ productListPage }) => {
    await productListPage.gotoSearch("asdfghjk");
    await expect(productListPage.searchNoResultsMsg).toBeVisible();
  });

  test("Search with minimum characters", async ({ productListPage }) => {
    await productListPage.gotoSearch("as");
    await expect(productListPage.searchMinCharsMsg).toBeVisible();
  });

  test("Advanced Search with Category Filter", async ({ productListPage }) => {
    await productListPage.gotoSearch("apple");
    await productListPage.searchAdvancedCheckbox.check();
    await productListPage.searchCategoryList.selectOption(
      "Electronics >> Cell phones",
    );
    await productListPage.searchPageBtn.click();
    await expect(productListPage.productCards).not.toHaveCount(0);
    await expect(productListPage.getProductByName("iphone")).toBeVisible();
  });

  test("Advanced Search with Manufacturer Filter", async ({
    productListPage,
  }) => {
    await productListPage.gotoSearch("phone");
    await productListPage.searchAdvancedCheckbox.check();
    await productListPage.searchManufacturerList.selectOption("HTC");
    await productListPage.searchPageBtn.click();
    // Verify results were filtered down
    await expect(productListPage.productCards).not.toHaveCount(0);
    // Verify no non-HTC products appear
    await expect(productListPage.getProductByName("Apple")).not.toBeVisible();
  });
});

test.describe("Product - Category Navigation", () => {
  test("Check topbar categories", async ({ basePage, page }) => {
    await page.goto("/");
    const topCategoryLink = basePage.getCategoryLink("Electronics");
    const href = await topCategoryLink.getAttribute("href");
    await topCategoryLink.click();
    await expect(page).toHaveURL(href!);
  });

  test("Check leftside categories", async ({ page, productListPage }) => {
    await page.goto("/search");
    const leftCategoryLink =
      productListPage.getSidebarCategoryLink("Electronics");
    const href = await leftCategoryLink.getAttribute("href");
    await leftCategoryLink.click();
    await expect(page).toHaveURL(href!);
  });

  test("Check breadcrumb navigation", async ({ page, productListPage }) => {
    await page.goto("/search");
    await page.getByRole("button", { name: "Electronics" }).hover();
    await page.getByRole("button", { name: "Camera & photo" }).click();
    const parentLink = productListPage.getBreadcrumbLink("Electronics");
    const href = await parentLink.getAttribute("href");
    await parentLink.click();
    await expect(page).toHaveURL(href!);
  });
});

test.describe("Product - Sort & Display", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cell-phones");
  });
  test("Sort by price low to high and check order", async ({
    productListPage,
    page,
  }) => {
    await productListPage.sortByDropdown.selectOption({
      label: "Price: Low to High",
    });

    await page.waitForLoadState("networkidle");

    // Grab all existing prices
    const prices = await productListPage.productCards
      .locator(".actual-price")
      .allTextContents();

    // Convert "$1,200.00" strings to numbers
    const numericPrices = prices.map((p) =>
      parseFloat(p.replace(/[^0-9.]/g, "")),
    );

    // Check each price is <= the next one
    for (let i = 0; i < numericPrices.length - 1; i++) {
      expect(numericPrices[i]).toBeLessThanOrEqual(numericPrices[i + 1]);
    }
  });

  test("Sort by price high to low and check order", async ({
    productListPage,
    page,
  }) => {
    await productListPage.sortByDropdown.selectOption({
      label: "Price: High to Low",
    });

    await page.waitForLoadState("networkidle");

    // Grab all existing prices
    const prices = await productListPage.productCards
      .locator(".actual-price")
      .allTextContents();

    // Convert "$1,200.00" strings to numbers
    const numericPrices = prices.map((p) =>
      parseFloat(p.replace(/[^0-9.]/g, "")),
    );

    // Check each price is <= the next one
    for (let i = 0; i < numericPrices.length - 1; i++) {
      expect(numericPrices[i]).toBeGreaterThanOrEqual(numericPrices[i + 1]);
    }
  });

  test("Sort by name Z to A and check order", async ({
    productListPage,
    page,
  }) => {
    await productListPage.sortByDropdown.selectOption({
      label: "Name: Z to A",
    });

    await page.waitForLoadState("networkidle");

    // Grab all existing names
    const names = await productListPage.productCards
      .locator(".product-title a")
      .allTextContents();

    // Check each name is >= the next one (reverse alphabetical Z to A)
    for (let i = 0; i < names.length - 1; i++) {
      expect(names[i].localeCompare(names[i + 1])).toBeGreaterThanOrEqual(0);
    }
  });

  test("Change number of items displayed and check number of products shown", async ({
    productListPage,
    page,
  }) => {
    await productListPage.displayPerPageDropdown.selectOption({
      label: "3",
    });
    await page.waitForLoadState("networkidle");
    await expect(productListPage.productCards).toHaveCount(3);
  });

  test("Toggle between List View and Grid View", async ({
    productListPage,
    page,
  }) => {
    await productListPage.listViewBtn.click();
    await expect(productListPage.listViewBtn).toHaveClass(/selected/);
    await expect(page).toHaveURL(/viewmode=list/);
    await productListPage.gridViewBtn.click();
    await expect(productListPage.gridViewBtn).toHaveClass(/selected/);
    await expect(page).toHaveURL(/viewmode=grid/);
  });

  test("Check pagination", async ({ productListPage, page }) => {
    await expect(productListPage.pagerCurrentPage).toHaveText("1");

    // Save page 1 product names
    const page1Products = await productListPage.productCards
      .locator(".product-title a")
      .allTextContents();

    // Click page 2
    await productListPage.getPagerLink(2).click();
    await expect(productListPage.pagerCurrentPage).toHaveText("2");

    // Verify different products are shown
    const page2Products = await productListPage.productCards
      .locator(".product-title a")
      .allTextContents();
    expect(page2Products).not.toEqual(page1Products);

    // Test next button — go back to page 1 first, then use next
    await productListPage.getPagerLink(1).click();
    await productListPage.pagerNext.click();
    await expect(productListPage.pagerCurrentPage).toHaveText("2");
  });
});

test.describe("Product Card Actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cell-phones");
  });
  test("Click on Product Card and navigate to Product Detail page", async ({
    productListPage,
    page,
  }) => {
    const href = await productListPage
      .getProductByName("Apple iPhone 16 128GB")
      .locator(".product-title a")
      .getAttribute("href");
    await productListPage.getProductByName("Apple iPhone 16 128GB").click();
    await expect(page).toHaveURL(href!);
    await expect(productListPage.breadcrumb).toContainText(
      "Apple iPhone 16 128GB",
    );
  });

  test("Add product to cart and verify top confirmation message", async ({
    basePage,
    page,
    productListPage,
  }) => {
    const firstProduct = productListPage.productCards.first();
    const productName = await firstProduct
      .locator(".product-title a")
      .innerText();
    await firstProduct.getByRole("button", { name: "Add to cart" }).click();
    await expect(basePage.addedToCartMsg).toBeVisible();
    await basePage.cartLink.hover();
    await expect(page.locator(".flyout-cart .name")).toContainText(productName);
  });

  test("Add two products to Compare feature and check Comparison Page", async ({
    productListPage,
    page,
    basePage,
  }) => {
    const firstName = await productListPage.productCards
      .nth(0)
      .locator(".product-title a")
      .innerText();
    const secondName = await productListPage.productCards
      .nth(1)
      .locator(".product-title a")
      .innerText();

    await productListPage.getProductCompareBtn(firstName).click();
    await expect(basePage.addedToCompareMsg).toBeVisible();
    await basePage.addedToCompareMsg.waitFor({ state: "hidden" });
    await productListPage.getProductCompareBtn(secondName).click();
    await expect(basePage.addedToCompareMsg).toBeVisible();
    await page.goto("/compareproducts");
    await expect(page.locator(".compare-products-table")).toContainText(
      firstName,
    );
    await expect(page.locator(".compare-products-table")).toContainText(
      secondName,
    );
  });

  test("Add two products to Wishlist feature and check Wishlist Page", async ({
    productListPage,
    page,
    basePage,
  }) => {
    const firstName = await productListPage.productCards
      .nth(0)
      .locator(".product-title a")
      .innerText();
    const secondName = await productListPage.productCards
      .nth(1)
      .locator(".product-title a")
      .innerText();
    await productListPage.getProductWishlistBtn(firstName).click();
    await expect(basePage.addedToWishlistMsg).toBeVisible();
    await basePage.addedToWishlistMsg.waitFor({ state: "hidden" });
    await productListPage.getProductWishlistBtn(secondName).click();
    await expect(basePage.addedToWishlistMsg).toBeVisible();
    await page.goto("/wishlist");
    await expect(page.locator(".wishlist-content .product-name")).toContainText(
      [firstName, secondName],
    );
  });
});
