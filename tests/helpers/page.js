const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build () {
    const browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === 'ci' ? true : false,
      args: process.env.NODE_ENV === 'ci' ? ['--no-sandbox'] : []
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page);
    return new Proxy(customPage, {
      get: function(target, property){
        return browser[property] || page[property] || customPage[property]
      }
    });
  }
  // Constructore of CustomPage
  constructor(page){
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const {session, sig} = sessionFactory(user);

    await this.page.setCookie({name: 'session', value: session});
    await this.page.setCookie({name: 'session.sig', value: sig});
    // Refresh
    await this.page.goto('http://localhost:3000/blogs');
    await this.page.waitFor('#logout')
  }

  async getContentsOf(selector){
    return this.page.$eval(selector, el => el.innerHTML);
  }
}

module.exports = CustomPage;
