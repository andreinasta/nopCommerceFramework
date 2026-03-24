import { Page, Locator } from "@playwright/test";

export class BasePage {
  readonly page: Page;

  // Header - Common
  readonly cartLink: Locator;
  readonly addedToCompareMsg: Locator;
  readonly addedToCartMsg: Locator;
  readonly addedToWishlistMsg: Locator;

  readonly searchField: Locator;
  readonly searchBtn: Locator;

  // Header - Logged In
  readonly myAccountLink: Locator;
  readonly logoutLink: Locator;

  // Header - Logged Out
  readonly registerLink: Locator;
  readonly loginLink: Locator;

  // Footer
  readonly footerLinks: Locator;

  constructor(page: Page) {
    this.page = page;

    //Header - Common
    this.cartLink = page.getByRole("link", {
      name: "Shopping cart",
      exact: true,
    });
    this.addedToCartMsg = page.locator("div").filter({
      hasText: /^The product has been added to your shopping cart$/,
    });
    this.addedToCompareMsg = page.locator("div").filter({
      hasText: /^The product has been added to your product comparison$/,
    });
    this.addedToWishlistMsg = page
      .locator("div")
      .filter({ hasText: /^The product has been added to your wishlist$/ });
    this.searchField = page.getByRole("textbox", { name: "Search store" });
    this.searchBtn = page.getByRole("button", { name: "Search" });

    // Header - Logged In
    this.myAccountLink = page
      .getByRole("banner")
      .getByRole("link", { name: "My account" });
    this.logoutLink = page.getByRole("link", { name: "Log out" });

    // Header - Logged out
    this.registerLink = page.getByRole("link", { name: "Register" });
    this.loginLink = page.getByRole("link", { name: "Log in" });

    // Footer
    this.footerLinks = page
      .getByRole("navigation")
      .filter({ hasText: "Information Sitemap Shipping" });
  }
  getCategoryLink(name: string) {
    return this.page.locator("a.menu__link").filter({ hasText: name });
  }
}
