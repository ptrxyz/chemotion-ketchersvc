import { config } from 'dotenv'
import Piscina from 'piscina'
import { resolve } from 'path'

import Fastify from 'fastify'

config({ path: resolve(__dirname, '.env') })

const fastify = Fastify({
	logger: true
})

const piscina = new Piscina({
	filename: resolve(__dirname, 'worker.js'),
	minThreads: parseInt(process.env['CONFIG_MIN_WORKERS'] || '1'),
	maxThreads: parseInt(process.env['CONFIG_MAX_WORKERS'] || '4')
})

piscina.addListener('error', (err) => {
	console.error(err)
	process.exit(1)
})

const schema = {
	querystring: {
		type: 'object',
		properties: {
			id: { type: 'string' }
		}
	},
	body: {
		type: 'object',
		required: ['molfile'],
		properties: {
			molfile: { type: 'string' }
		}
	}
}

interface IRenderBody {
	molfile: string
}

interface IRenderQuery {
	id: string
}

fastify.post<{ Body: IRenderBody; Querystring: IRenderQuery }>(
	'/render',
	{ schema },
	async (request, reply) => {
		const { molfile } = request.body
		const ret = await piscina.run({ molfile })
		if (ret.startsWith('<svg ')) {
			reply.code(200).send(ret)
		} else {
			reply.code(500)
		}
	}
)

// Run the server!
const start = async () => {
	try {
		const port: number = parseInt(process.env['CONFIG_PORT'] || '9000')
		await fastify.listen({ port: port, host: '0.0.0.0' })
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}
start()
