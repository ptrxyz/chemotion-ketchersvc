'use strict'

import { IConfig, configure } from './config'
import * as piscina_pool from './pool'
import * as fastify_server from './server'

// Run the server!
const start = async (config: IConfig) => {
	try {
		console.log('Using this configuration:')
		console.log(config)

		const piscina = piscina_pool.build(config)
		const fastify = fastify_server.build({
			piscina: piscina
		})

		try {
			await fastify.listen({ port: config.port, host: '0.0.0.0' })
		} catch (e) {
			fastify.log.error(e)
			process.exit(3)
		}
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
start(configure())
