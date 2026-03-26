import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class ProductDetailPage extends BasePage {
  //Product
  readonly productTitle: Locator;
  readonly reviewStars: Locator;
  readonly reviewLink: Locator;
  readonly skuValue: Locator;
  readonly price: Locator;
  readonly addQuantityField: Locator;
  readonly addToCartBtn: Locator;
  readonly addToWishlistBtn: Locator;
  readonly addToCompareBtn: Locator;
  readonly emailProductBtn: Locator;
  readonly productDescription: Locator;
  readonly productTags: Locator;
  readonly reviewEntry: Locator;

  constructor(page: Page) {
    super(page);

    this.productTitle = page.locator(".product-name");
    this.reviewStars = page.locator(".product-review-box .rating > div");
    this.reviewLink = page.getByRole("link", { name: /review\(s\)/ });
    this.skuValue = page.locator(".sku");
    this.price = page.locator(".product-price");
    this.addQuantityField = page.getByRole("textbox", {
      name: "Enter a quantity",
    });
    this.addToCartBtn = page.getByRole("button", { name: "Add to cart" });
    this.addToWishlistBtn = page.getByRole("button", {
      name: "Add to wishlist",
    });
    this.addToCompareBtn = page.getByRole("button", {
      name: "Add to compare list",
    });
    this.emailProductBtn = page.getByRole("button", { name: "Email a friend" });
    this.productDescription = page.locator(".full-description");
    this.productTags = page.locator(".product-tags-list");
    this.reviewEntry = page.locator(".product-review-item");
  }
}
