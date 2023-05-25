import Root from '../../components/Root.js';
import { browser } from '../../index.js';

export default async function screenshotHTML(children: string) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 640, height: 1 });
  await page.setContent(Root(children));
  const screenshot = await page
    .locator('#root')
    .screenshot({ omitBackground: true, scale: 'css' });
  await page.close();

  return screenshot;
}
