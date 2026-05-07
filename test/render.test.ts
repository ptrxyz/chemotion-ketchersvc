import { expect, test } from 'bun:test'

import { BrowserControl } from '../src/render'

type EvaluatePage = {
	evaluate: (...args: unknown[]) => Promise<unknown>
}

type PrivateOverrides = {
	ensureInitialized: () => Promise<{ page: EvaluatePage; ketcherURL: string }>
	restart: () => Promise<{ page: EvaluatePage; ketcherURL: string }>
}

test('renderSerialized restarts and retries when evaluate fails with recoverable Playwright error', async () => {
	const molfile = 'mock molfile'
	const expectedSvg = '<svg><!--retry-ok--></svg>'

	let firstEvaluateCalls = 0
	let secondEvaluateCalls = 0
	let restartCalls = 0

	const firstPage = {
		evaluate: async () => {
			firstEvaluateCalls += 1
			throw new Error('Target page, context or browser has been closed')
		}
	}

	const secondPage = {
		evaluate: async (...args: unknown[]) => {
			const inputMolfile = args[1] as string
			secondEvaluateCalls += 1
			expect(inputMolfile).toBe(molfile)
			return expectedSvg
		}
	}

	const bc = new BrowserControl('http://example.invalid')
	const bcOverrides = bc as unknown as PrivateOverrides

	bcOverrides.ensureInitialized = async () => ({ page: firstPage, ketcherURL: 'mock://ketcher' })
	bcOverrides.restart = async () => {
		restartCalls += 1
		return { page: secondPage, ketcherURL: 'mock://ketcher' }
	}

	const svg = await bc.renderSerialized(molfile)

	expect(svg).toBe(expectedSvg)
	expect(firstEvaluateCalls).toBe(1)
	expect(restartCalls).toBe(1)
	expect(secondEvaluateCalls).toBe(1)
})

test('renderSerialized does not restart on non-recoverable error', async () => {
	const bc = new BrowserControl('http://example.invalid')
	const bcOverrides = bc as unknown as PrivateOverrides

	let restartCalls = 0
	const nonRecoverableError = new Error('some unrelated render failure')
	const page = {
		evaluate: async () => {
			throw nonRecoverableError
		}
	}

	bcOverrides.ensureInitialized = async () => ({ page, ketcherURL: 'mock://ketcher' })
	bcOverrides.restart = async () => {
		restartCalls += 1
		return { page, ketcherURL: 'mock://ketcher' }
	}

	await expect(bc.renderSerialized('mock molfile')).rejects.toBe(nonRecoverableError)
	expect(restartCalls).toBe(0)
})
