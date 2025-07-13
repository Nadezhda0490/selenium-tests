import { Builder, By, until, Key } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import chromedriver from "chromedriver";
import { describe, it, before, after } from "mocha";
import { expect } from "chai";

let driver;

describe("Onliner: Car Classifieds: UI tests", function () {
  this.timeout(60000);

  before(async () => {
    const service = new chrome.ServiceBuilder(chromedriver.path);
    const options = new chrome.Options();
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeService(service)
      .setChromeOptions(options)
      .build();
    await driver.manage().window().maximize();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("should open the Car Classifieds page", async () => {
    await driver.get("https://onliner.by");

    const usedCarsEl = await driver.wait(
      until.elementLocated(
        By.css(
          ".b-main-navigation > .b-main-navigation__item:nth-of-type(3) .b-main-navigation__link"
        )
      ),
      5000
    );
    await driver.wait(until.elementIsVisible(usedCarsEl), 5000);

    const actions = driver.actions({ bridge: true });
    await actions.move({ origin: usedCarsEl }).click().perform();

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include("ab.onliner.by");

    const searchInput = await driver.wait(
      until.elementLocated(By.css("input.fast-search__input")),
      5000
    );
    const isSearchVisible = await searchInput.isDisplayed();
    expect(isSearchVisible).to.be.true;
  });

  it("should navigate to the Moto Classifieds from the Car Classifieds page", async () => {
    await driver.get("https://onliner.by");

    const usedCarsEl = await driver.wait(
      until.elementLocated(
        By.css(
          ".b-main-navigation > .b-main-navigation__item:nth-of-type(3) .b-main-navigation__link"
        )
      ),
      5000
    );
    const actions = driver.actions({ bridge: true });
    await actions.move({ origin: usedCarsEl }).click().perform();

    const motoEl = await driver.findElement(
      By.css(".project-navigation__item:nth-of-type(2)")
    );
    await motoEl.click();
    await driver.wait(until.urlContains("/mb"), 5000);

    const motoTitle = await driver.wait(
      until.elementLocated(By.className("m-title")),
      5000
    );
    const titleText = await motoTitle.getText();
    expect(titleText).to.equal("Мотобарахолка");
  });

  it("should open detail page for selected car", async () => {
    await driver.get("https://onliner.by");

    const usedCarsEl = await driver.wait(
      until.elementLocated(
        By.css(
          ".b-main-navigation > .b-main-navigation__item:nth-of-type(3) .b-main-navigation__link"
        )
      ),
      5000
    );
    const actions = driver.actions({ bridge: true });
    await actions.move({ origin: usedCarsEl }).click().perform();

    await driver.wait(
      until.elementLocated(By.css(".vehicle-form__offers-list")),
      5000
    );
    await driver.wait(
      until.elementLocated(By.css(".vehicle-form__offers-list > a")),
      5000
    );

    const offers = await driver.findElements(
      By.css(".vehicle-form__offers-list > a")
    );
    if (offers.length === 0) {
      throw new Error("No offers found!");
    }

    const authPopup = await driver.findElements(By.css(".auth-form"));
    if (authPopup.length > 0) {
      const closeBtn = await driver.findElements(By.css(".auth-form__close"));
      if (closeBtn.length > 0) {
        await closeBtn[0].click();
        await driver.wait(until.stalenessOf(authPopup[0]), 5000);
      } else {
        await driver.actions().sendKeys(Key.ESCAPE).perform();
      }
    }

    await driver.executeScript("arguments[0].scrollIntoView(true);", offers[0]);
    await offers[0].click();

    await driver.wait(until.urlMatches(/\/[0-9]+\/?$/), 5000);

    const carTitle = await driver.wait(
      until.elementLocated(
        By.css("h1.vehicle-form__title.vehicle-form__title_big-alter")
      ),
      5000
    );
    const titleText = await carTitle.getText();
    expect(titleText).to.not.be.empty;
  });

  it("should display filters on the Car Classifieds page", async () => {
    await driver.get("https://onliner.by");

    const usedCarsEl = await driver.wait(
      until.elementLocated(
        By.css(
          ".b-main-navigation > .b-main-navigation__item:nth-of-type(3) .b-main-navigation__link"
        )
      ),
      5000
    );
    const actions = driver.actions({ bridge: true });
    await actions.move({ origin: usedCarsEl }).click().perform();

    await driver.wait(
      until.elementLocated(By.css(".vehicle-form__filter")),
      5000
    );

    const filters = await driver.wait(
      until.elementLocated(By.css(".vehicle-form__filter-overflow")),
      5000
    );
    const isFiltersDisplayed = await filters.isDisplayed();
    expect(isFiltersDisplayed).to.be.true;
  });

  it("should open the dropdown when clicking the 'All countries' field", async () => {
    await driver.get("https://onliner.by");

    const cookieBtn = await driver.findElements(By.id("submit-button"));
    if (cookieBtn.length > 0) {
      await driver.executeScript(
        "arguments[0].scrollIntoView(true);",
        cookieBtn[0]
      );
      await driver.sleep(500);
      await cookieBtn[0].click();
      await driver.sleep(1000);
    }

    const usedCarsEl = await driver.wait(
      until.elementLocated(
        By.css(
          ".b-main-navigation > .b-main-navigation__item:nth-of-type(3) .b-main-navigation__link"
        )
      ),
      5000
    );
    const actions = driver.actions({ bridge: true });
    await actions.move({ origin: usedCarsEl }).click().perform();

    await driver.wait(
      until.elementLocated(By.css(".vehicle-form__filter")),
      5000
    );

    const countryFilter = await driver.wait(
      until.elementLocated(
        By.xpath("(//div[contains(@class,'input-style__real')])[1]")
      ),
      5000
    );

    await driver.executeScript(
      "arguments[0].scrollIntoView(true);",
      countryFilter
    );
    await driver.sleep(500);
    await countryFilter.click();
    await driver.sleep(1000);

    const countryInput = await driver.wait(
      until.elementLocated(
        By.xpath("//input[contains(@placeholder,'Найти страну')]")
      ),
      5000
    );
    await driver.wait(until.elementIsVisible(countryInput), 5000);
    expect(await countryInput.isDisplayed()).to.be.true;
  });
});
