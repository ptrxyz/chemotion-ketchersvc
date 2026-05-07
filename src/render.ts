import type { Browser, BrowserContext, Page } from 'playwright'

import { chromium } from 'playwright'

const BROWSER_READY_TIMEOUT_MS = 15_000

export class BrowserControl {
	public page: Page | null = null

	private browser: Browser | null = null
	private context: BrowserContext | null = null
	private initPromise: Promise<{ page: Page; ketcherURL: string }> | null = null
	private renderQueue: Promise<void> = Promise.resolve()

	constructor(
		private ketcherURL = 'http://localhost:14000/ketcher/ketcher.html',
		private chromiumExecutablePath?: string
	) {}

	private isUsable = () => {
		if (!this.page || this.page.isClosed()) return false
		if (!this.browser || !this.browser.isConnected()) return false
		return true
	}

	public close = async () => {
		const closers: Promise<void>[] = []

		if (this.page) closers.push(this.page.close().catch(() => undefined))
		if (this.context) closers.push(this.context.close().catch(() => undefined))
		if (this.browser) closers.push(this.browser.close().catch(() => undefined))

		await Promise.all(closers)

		this.page = null
		this.context = null
		this.browser = null
	}

	private ensureInitialized = async () => {
		if (this.isUsable()) return { page: this.page as Page, ketcherURL: this.ketcherURL }

		if (this.initPromise) return this.initPromise

		this.initPromise = (async () => {
			await this.close()

			const script = await Bun.file(`${import.meta.dirname}/assets/script.js`).text()
			const browser = await chromium.launch({
				headless: true,
				executablePath: this.chromiumExecutablePath
			})
			const context = await browser.newContext()
			const page = await context.newPage()

			await page.goto(this.ketcherURL, { timeout: BROWSER_READY_TIMEOUT_MS })
			await page.waitForFunction(
				() => Boolean((window as unknown as { ketcher?: unknown }).ketcher),
				undefined,
				{ timeout: BROWSER_READY_TIMEOUT_MS }
			)
			// @ts-expect-error -- this is the script that runs inside the context of the browser
			await page.evaluate(new Function(script))

			this.browser = browser
			this.context = context
			this.page = page

			return { page, ketcherURL: this.ketcherURL }
		})()
			.catch(async (error) => {
				await this.close()
				throw error
			})
			.finally(() => {
				this.initPromise = null
			})

		return this.initPromise
	}

	public initialize = async () => this.ensureInitialized()

	public restart = async () => {
		await this.close()
		return this.initialize()
	}

	private shouldRetryRender = (error: unknown) => {
		if (!(error instanceof Error)) return false
		const message = error.message.toLowerCase()
		return (
			message.includes('target page, context or browser has been closed') ||
			message.includes('page crashed') ||
			message.includes('session closed') ||
			message.includes('protocol error')
		)
	}

	private doRender = async (molfile: string) => {
		let { page } = await this.ensureInitialized()

		try {
			const result = await page.evaluate((mf: string) => {
				// @ts-expect-error -- this is the script that runs inside the context of the browser
				return window.renderMolfile(mf)
			}, molfile)

			return result as string
		} catch (error) {
			if (!this.shouldRetryRender(error)) throw error
			const restarted = await this.restart()
			page = restarted.page

			const result = await page.evaluate((mf: string) => {
				// @ts-expect-error -- this is the script that runs inside the context of the browser
				return window.renderMolfile(mf)
			}, molfile)

			return result as string
		}
	}

	public renderSerialized = async (molfile: string) => {
		const run = this.renderQueue.then(
			async () => this.doRender(molfile),
			async () => this.doRender(molfile)
		)

		this.renderQueue = run.then(
			() => undefined,
			() => undefined
		)

		return run
	}
}

export async function render(bc: BrowserControl, molfile: string) {
	return bc.renderSerialized(molfile)
}
