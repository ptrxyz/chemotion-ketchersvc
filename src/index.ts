import { staticPlugin } from '@elysiajs/static'
import Debug from 'debug'
import { Elysia } from 'elysia'

import { config } from './config'
import { KetcherPlugin } from './plugin-ketcher'
import { BrowserControl } from './render'

const logger = Debug('Ketcher:')
if (!logger.enabled) Debug.debug.enable('Ketcher:*')
const bc = new BrowserControl(config.ketcherURL, config.chromiumExecutablePath)

let isShuttingDown = false

const shutdown = async (signal: NodeJS.Signals) => {
	if (isShuttingDown) return
	isShuttingDown = true
	logger(`Received ${signal}, shutting down browser...`)
	await bc.close()
	process.exit(0)
}

process.on('SIGINT', () => {
	void shutdown('SIGINT')
})

process.on('SIGTERM', () => {
	void shutdown('SIGTERM')
})

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
		port: config.port,
		hostname: '0.0.0.0'
	})

logger(`🚀 Starting up...`)

const { ketcherURL } = await bc.initialize()
logger(`Ketcher is running on [${ketcherURL}]`)

logger(
	`🔥 KetcherService is running on [${app.server?.hostname ?? 'UNKNOWN'}:${app.server?.port.toString() ?? 'UNKNOWN'}]`
)

export { app }
export type App = typeof app
