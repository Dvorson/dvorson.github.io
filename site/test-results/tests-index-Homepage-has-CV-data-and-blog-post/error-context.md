# Test info

- Name: Homepage has CV data and blog post
- Location: /Users/Anton_Dvorson/Projects/dvorson.github.io/site/tests/index.spec.ts:3:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/
Call log:
  - navigating to "http://localhost:4321/", waiting until "load"

    at /Users/Anton_Dvorson/Projects/dvorson.github.io/site/tests/index.spec.ts:4:14
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('Homepage has CV data and blog post', async ({ page }) => {
>  4 |   await page.goto('http://localhost:4321/');
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4321/
   5 |
   6 |   // Check CV data
   7 |   await expect(page.locator('h1.text-4xl')).toContainText('Dmitry V.');
   8 |   await expect(page.locator('p.text-xl')).toContainText('Software Engineer');
   9 |   await expect(page.locator('p.mt-4')).toContainText('Experienced software engineer');
  10 |
  11 |   // Check blog post title
  12 |   await expect(page.locator('a.text-blue-600')).toContainText('Hello World: First Blog Post');
  13 | });
```