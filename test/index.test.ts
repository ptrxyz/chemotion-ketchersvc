// test/index.test.ts
import type { App } from '../src/index'

import { treaty } from '@elysiajs/eden'
import { beforeAll, afterAll } from 'bun:test'
import { test, expect } from 'bun:test'

import '../src/index'

let api: ReturnType<typeof treaty<App>>

beforeAll(async () => {
	api = treaty<App>('http://localhost:3000')
})

afterAll(async () => {
	//
})

const testSVG = (svg: string) => {
	expect(svg).toStartWith('<svg ')
	expect(svg).toEndWith('></svg>')
	expect(svg).toContain('<!--Created by Ketcher Backend Service.-->')
	expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
}

test('get status', async () => {
	const response = await api.status.get()
	expect(response.data).toBe('running')
})

test('render single SVG', async () => {
	const molfile = await Bun.file('test/fixtures/molfile/test.mol').text()
	const apiResponse = await api.render.post({ molfile })
	expect(apiResponse.status).toBe(200)
	expect(apiResponse.data).not.toBeNull()
	expect(apiResponse.data).toHaveProperty('svg')
	expect(apiResponse.data?.svg).toBeString()
	const svg = apiResponse.data?.svg ?? ''
	testSVG(svg)
})

test('render many SVG', async () => {
	const molfile = await Bun.file('test/fixtures/molfile/test.mol').text()

	const MAX_RUNS = 100
	const many = Array.from({ length: MAX_RUNS }, async () => api.render.post({ molfile }))
	const results = await Promise.allSettled(many)
	const fails = results.filter((r) => r.status === 'rejected')
	const succeeds = results.filter((r) => r.status === 'fulfilled')

	expect(fails).toHaveLength(0)
	expect(succeeds).toHaveLength(MAX_RUNS)

	for (const result of succeeds) {
		const apiResponse = result.value as Awaited<ReturnType<typeof api.render.post>>
		expect(apiResponse.status).toBe(200)
		expect(apiResponse.data).not.toBeNull()
		expect(apiResponse.data).toHaveProperty('svg')
		expect(apiResponse.data?.svg).toBeString()
		const svg = apiResponse.data?.svg ?? ''
		testSVG(svg)
	}
})
