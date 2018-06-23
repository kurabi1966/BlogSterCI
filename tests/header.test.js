// const puppeteer = require('puppeteer');
// const sessionFactory = require('./factories/sessionFactory');
// const userFactory = require('./factories/userFactory');
const Page = require('./helpers/page');
let page;

beforeEach(async ()=>{
  page = await Page.build();
  await page.goto('http://localhost:3000');
  // browser = await puppeteer.launch({
  //   headless: false
  // });
  // page = await browser.newPage();
  // await page.goto('http://localhost:3000');
});

afterEach(async () => {
    // await browser.close();
    // await page.close();
});

test('the header has the correct text', async () => {

  // const text = await page.$eval('a.brand-logo', el => el.innerHTML);

  const text = await page.getContentsOf('a.brand-logo');

  expect(text).toEqual('Blogster');
});

test('clicking login start oauth flow', async () => {
  await page.click('.right a');
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test('when signed in, shows My Blogs and Logout buttons', async()=>{
  await page.login();
  const logout = await page.getContentsOf('#logout');
  expect(logout).toEqual('Logout');

  const myblogs = await page.getContentsOf('#myblogs');
  expect(myblogs).toEqual('My Blogs');

});

// const logout = await page.$eval('#logout', el => el.innerHTML);