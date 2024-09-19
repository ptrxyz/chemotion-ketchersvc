import type { Page } from 'playwright'

import { chromium } from 'playwright'

export class BrowserControl {
	public page: Page | null = null
	constructor(private ketcherURL = 'http://localhost:3000/ketcher/ketcher.html') {}

	public initalize = async () => {
		const script = await Bun.file(`${import.meta.dirname}/assets/script.js`).text()
		const browser = await chromium.launch({ headless: true })
		const page = await browser.newPage()
		await page.goto(this.ketcherURL)
		await page.waitForFunction('window.ketcher')
		// @ts-expect-error -- this is the script that runs inside the context of the browser
		await page.evaluate(new Function(script))
		this.page = page
		return { page, ketcherURL: this.ketcherURL }
	}
}

export async function render(bc: BrowserControl, molfile: string) {
	let page = bc.page
	if (!page) page = (await bc.initalize()).page

	const result = await page.evaluate((mf: string) => {
		// @ts-expect-error -- this is the script that runs inside the context of the browser
		return window.renderMolfile(mf)
	}, molfile)

	return result as string
}
