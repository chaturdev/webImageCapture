const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const moment = require('moment');
const async = require('async');
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.post('/screenshot', async (req, res, next) => {
  const { URI } = req.body;
  console.log(URI);
  try {
    if (!URI) {
      return res.status(404).jsonp({
        status: 'error',
        message: 'URI, parameter is missing!'
      });
    }
    const myURL = new URL('', URI);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation({ waitUntil: "domcontentloaded" });
    await page.goto(myURL, { waitUntil: 'load', timeout: 0 });
    const elementHandles = await page.$$('a');
    const propertyJsHandles = await Promise.all(
      elementHandles.map(handle => handle.getProperty('href'))
    );
    const hrefs2 = await Promise.all(
      propertyJsHandles.map(handle => handle.jsonValue())
    );

    async.mapSeries(hrefs2, async (hrf, cb) => {

      if (hrf.indexOf(URI) > -1) {
        console.log(hrf, "here")
        await page.goto(hrf, { waitUntil: 'load', timeout: 0 });

        await page.screenshot({ path: __dirname + `/../public/images/${moment().unix()}.png`, fullPage: true });
      }

      //return cb();
    }, async (er, res1) => {
      console.log("here")
      await browser.close();
      return res.status(200).jsonp({
        status: 'success',
        message: 'Success'
      });
    })
    //  await page.screenshot({ path: __dirname + `/../public/images/${moment().unix()}.png`, fullPage: true });
    // await browser.close();


  } catch (error) {
    console.log(error);
    return res.status(500).jsonp({
      status: 'error',
      message: 'Something broke!'
    });
  }
});

module.exports = router;
