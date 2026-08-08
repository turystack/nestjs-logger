import { afterEach, describe, expect, it } from 'vitest'

import { registerLogContext, withLogContext } from '@/logger.context.js'

afterEach(() => {
	registerLogContext(undefined)
})

describe('withLogContext', () => {
	it('leaves args untouched when nothing is registered', () => {
		expect(
			withLogContext({
				orderId: 'o1',
			}),
		).toEqual({
			orderId: 'o1',
		})
	})

	it('attaches the ambient fields', () => {
		registerLogContext(() => ({
			correlationId: 'req-1',
		}))

		expect(
			withLogContext({
				orderId: 'o1',
			}),
		).toEqual({
			correlationId: 'req-1',
			orderId: 'o1',
		})
	})

	it('produces the ambient fields when the caller passed none', () => {
		registerLogContext(() => ({
			correlationId: 'req-1',
		}))

		expect(withLogContext()).toEqual({
			correlationId: 'req-1',
		})
	})

	it('lets the caller win a key collision — an explicit value is more specific', () => {
		registerLogContext(() => ({
			correlationId: 'ambient',
		}))

		expect(
			withLogContext({
				correlationId: 'explicit',
			}),
		).toEqual({
			correlationId: 'explicit',
		})
	})

	it('keeps a non-object argument instead of dropping it', () => {
		registerLogContext(() => ({
			correlationId: 'req-1',
		}))

		expect(withLogContext('plain string')).toEqual({
			correlationId: 'req-1',
			value: 'plain string',
		})
	})

	it('keeps an array argument instead of spreading it', () => {
		registerLogContext(() => ({
			correlationId: 'req-1',
		}))

		expect(
			withLogContext([
				1,
				2,
			]),
		).toEqual({
			correlationId: 'req-1',
			value: [
				1,
				2,
			],
		})
	})

	it('leaves args untouched outside an operation', () => {
		registerLogContext(() => undefined)

		expect(
			withLogContext({
				orderId: 'o1',
			}),
		).toEqual({
			orderId: 'o1',
		})
	})

	it('leaves args untouched when the context is empty', () => {
		registerLogContext(() => ({}))

		expect(
			withLogContext({
				orderId: 'o1',
			}),
		).toEqual({
			orderId: 'o1',
		})
	})
})
