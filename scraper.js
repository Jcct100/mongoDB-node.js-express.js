const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
require("dotenv").config();
const DesignPrinciples = require("./models/principles");

let browser;
const allData = [];
let json;
let arrayHeaders;

async function connectToMongoDB() {
  const uri = process.env.ATLAS_URI;
  mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });
  const connection = mongoose.connection;
  connection.once("open", () => {
    console.log("MongoDB database connection established successfully");
  });
}

async function scrapeHomesInIndexPage(url) {
  try {
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const homes = $(".tile a")
      .map(
        (i, element) => "https://principles.design" + $(element).attr("href")
      )
      .get();
    return homes;
  } catch (err) {
    console.error(errr);
  }
}

async function scrapeDescriptionPage(url, page) {
  try {
    await page.goto(url);
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    const title = $("body > main > div > div > header > h1").text();

    const author = $("body > main > div > div > aside > p:nth-child(1)")
      .text()
      .replace("Author:", " ");

    $("body > main > div > div > article > ol")
      .find("h2")
      .text((i, principles) => {
        const json = {
          title,
          author,
          principles
        };
        allData.push({ json });
      });
  } catch (err) {
    console.error(err);
  }
}

async function formatArray() {
  try {
    let allHeaders = [];

    allData.forEach((item, i) => {
      allHeaders.push(item.json.title);
    });

    const uniqueHeaders = new Set(allHeaders);
    arrayHeaders = [...uniqueHeaders];

    json = arrayHeaders.map(data => {
      return {
        header: data,
        authors: "",
        principles: []
      };
    });

    json.forEach(x =>
      allData.forEach(y => {
        if (x.header === y.json.title) {
          x.principles.push(y.json.principles);
          x.authors = y.json.author.replace(/\n/g, "");
        }
      })
    );
  } catch (err) {
    console.log("err", err);
  }
}

async function saveInMongoDB() {
  try {
    json.forEach(data => {
      const designPrinciple = new DesignPrinciples({
        header: data.header,
        author: data.authors,
        principles: data.principles
      });

      designPrinciple.save();
    });
  } catch (err) {
    console.log(err);
  }
}

async function insertPrinciplesInMongoDB() {
  try {
    const promises = arrayHeaders.map(async data => {
      const principleInDB = DesignPrinciples.findOne({ header: data.header });

      if (!principleInDB) {
        await saveInMongoDB();
      } else {
        console.log("dont save to MongoDB");
      }
    });

    await Promise.all(promises);
  } catch (err) {
    console.log("err", err);
  }
}

async function main() {
  await connectToMongoDB();

  browser = await puppeteer.launch({ headless: false });
  const descriptionPage = await browser.newPage();
  const homes = await scrapeHomesInIndexPage(
    "https://principles.design/examples"
  );

  for (var i = 0; i < homes.length; i++) {
    await scrapeDescriptionPage(homes[i], descriptionPage);
  }

  await formatArray();

  await insertPrinciplesInMongoDB();
  mongoose.disconnect();
  console.log("disconnected from mongodb");
}

main();
