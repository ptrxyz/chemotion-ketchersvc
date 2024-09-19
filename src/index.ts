import { staticPlugin } from '@elysiajs/static'
import Debug from 'debug'
import { Elysia } from 'elysia'

import { KetcherPlugin } from './plugin-ketcher'
import { BrowserControl } from './render'

process.on('SIGINT', () => {
	console.log('Caught interrupt signal')
	process.exit()
})

const logger = Debug('Ketcher:')
if (!logger.enabled) Debug.debug.enable('Ketcher:*')
const bc = new BrowserControl(process.env.KETCHER_URL)

const app = new Elysia()
	.use(
		staticPlugin({
			assets: `${import.meta.dirname}/assets/ketcher`,
			prefix: '/ketcher',
			headers: {
				'Cache-Control': 'public, max-age=31536000'
			}
		})
	)
	.use(KetcherPlugin({ bc, logger: logger.extend('Core') }))
	.listen({
		port: 3000,
		hostname: '0.0.0.0'
	})

logger(`🚀 Starting up...`)

const { ketcherURL } = await bc.initalize()
logger(`Ketcher is running on [${ketcherURL}]`)

logger(
	`🔥 KetcherService is running on [${app.server?.hostname ?? 'UNKNOWN'}:${app.server?.port.toString() ?? 'UNKNOWN'}]`
)

export { app }
export type App = typeof app
