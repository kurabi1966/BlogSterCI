const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When Logged in', async()=>{
  beforeEach(async()=>{
    await page.login();
    await page.click('#addblog');
  });
  test('can see blog create form', async() => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });
  describe('And useing invalid inputs', async() => {
    beforeEach(async() => {
        await page.click('form button');
    });
    test('the form shows error message', async () => {
      await page.waitFor('.title .red-text');
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });

  describe('And using valid inputs', async()=>{
    beforeEach(async() => {
      // Add title to the new blog
      await page.type('input[name="title"]', 'My Title');
      // add body to the new blog
      await page.type('input[name="content"]', 'My Content');
      // Submit the form:
      await page.click('button[type="submit"]');
    });

    test('submitting takes user to review screen', async()=>{
      const confirmHeader = await page.getContentsOf('form h5');
      expect(confirmHeader).toEqual('Please confirm your entries');
    });

    test('Save content will show in new Blog in the blogs page', async()=>{
      await page.click('button.green');
      await page.waitFor('.card-title')
      const blogTitle = await page.getContentsOf('.card-title');
      const blogContent = await page.getContentsOf('.card-content p');

      expect(blogTitle).toEqual('My Title');
      expect(blogContent).toEqual('My Content');
    });
  });
});

describe('When user not logged in', async () => {
    test('User can not create blog posts', async() => {
      const result = await page.evaluate(
        () => {
          return fetch('/api/blogs', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({title: 'My Title', content: 'My Content'})
          }).then(res => res.json());
        }
      );
      expect(result.error).toEqual('You must log in!');
    });

    test('User can not get a list of posts', async() => {
      const result = await page.evaluate(
        () => {
          return fetch('/api/blogs', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'}
          }).then(res => res.json());
        }
      );
      expect(result.error).toEqual('You must log in!');
    });
});


//
// describe('When using valid form inputs', async()=>{
//   beforeEach(async()=>{
//
//   });
//   // Test 1
//   // Test 2
// });
