'use strict'

import Fastify from 'fastify'
import Piscina from 'piscina'

interface IRenderBody {
	molfile: string
}

interface IRenderQuery {
	id: string
}

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

function build({ piscina }: { piscina: Piscina }) {
	const fastify = Fastify({
		logger: true
	})

	fastify.post<{ Body: IRenderBody; Querystring: IRenderQuery }>(
		'/render',
		{ schema },
		async (request, reply) => {
			const { molfile } = request.body
			const ret = await piscina.run({ molfile })
			if (ret.startsWith('<svg ')) {
				reply.code(200).send({ svg: ret })
			} else {
				reply.code(500)
			}
		}
	)

	return fastify
}

export { build }
