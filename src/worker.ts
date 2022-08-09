import { Builder, Browser, WebDriver } from 'selenium-webdriver'
import { error } from 'selenium-webdriver'
import fs from 'fs'
import chrome from 'selenium-webdriver/chrome'
import assert from 'assert'
import { resolve } from 'path'

function handleWDE(e: unknown): error.WebDriverError {
	const wde: error.WebDriverError = <error.WebDriverError>e
	delete wde.remoteStacktrace
	return wde
}

function throwKnownError(errorTable: Record<string, string>, e: error.WebDriverError): void {
	for (const [key, msg] of Object.entries(errorTable)) {
		if (e.message.includes(key)) {
			throw new Error(msg)
		}
	}
}

async function init(): Promise<WebDriver> {
	const script = fs.readFileSync(resolve(__dirname, 'assets', 'script.js'), 'utf8')

	const opts = new chrome.Options()
	opts.addArguments('--headless')
	opts.addArguments('--single-process')
	opts.addArguments('--disable-gpu')
	opts.addArguments('--no-sandbox')
	opts.addArguments('--disable-dev-shm-usage')
	opts.addArguments('--disable-setuid-sandbox')
	opts.addArguments('--disable-crashpad')
	opts.addArguments('--disable-web-security')
	opts.addArguments('--disable-extensions')

	const driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(opts).build()
	const ketcher_url: string =
		process.env['CONFIG_KETCHER_URL'] || 'http://chemotion.ptrxyz.de/ketcher2/'
	try {
		await driver.get(ketcher_url)
	} catch (e) {
		if (e instanceof error.WebDriverError) {
			const errorTable: Record<string, string> = {
				'net::ERR_NAME_NOT_RESOLVED': `Could not resolve ${ketcher_url}. Please make sure that CONFIG_KETCHER_URL is set properly.`,
				'net::ERR_CONNECTION_REFUSED': `Could not connect to ${ketcher_url}. Please make sure the server is running.`
			}
			throwKnownError(errorTable, e)
		}
		throw e
	}
	try {
		const title = await driver.getTitle()
		assert(title.includes('Ketcher'))
		await driver.executeScript(script)
		return driver
	} catch (e) {
		if (e instanceof error.WebDriverError) {
			throw handleWDE(e)
		} else if (e instanceof assert.AssertionError) {
			throw new Error('Could not find the ketcher script on the page.')
		}
		throw e
	}
}

function render(driver: WebDriver, molfile: string): Promise<string> {
	try {
		return driver.executeScript(`return renderMolfile(arguments[0])`, molfile)
	} catch (e) {
		if (e instanceof error.WebDriverError) {
			throw handleWDE(e)
		}
		throw e
	}
}

async function initalize(): Promise<({ molfile }: { molfile: string }) => Promise<string>> {
	const driver: WebDriver = await init()

	function do_render({ molfile }: { molfile: string }): Promise<string> {
		return render(driver, molfile)
	}

	return do_render
}

module.exports = initalize()
