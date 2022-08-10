'use strict'

import { IConfig, configure } from '../src/config'
import * as piscina_pool from '../src/pool'
import * as fastify_server from '../src/server'

const init = async (config: IConfig) => {
	console.log('Using this configuration:')
	console.log(config)

	const piscina = piscina_pool.build(config)
	const fastify = fastify_server.build({
		piscina: piscina
	})
	return fastify
}

// Run the test!
const run_tests = async () => {
	const fastify = await init(configure())
	const response = await fastify.inject({
		method: 'GET',
		url: '/'
	})

	console.log('status code: ', response.statusCode)
	console.log('body: ', response.body)
}
run_tests()
