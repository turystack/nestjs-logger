import type { Logger } from 'pino'
import { describe, expect, it, vi } from 'vitest'

import { PinoEsAdapter } from '@/pino-es/pino-es.adapter.js'

const createMockLogger = () => ({
	debug: vi.fn(),
	error: vi.fn(),
	info: vi.fn(),
	warn: vi.fn(),
})

describe('PinoEsAdapter', () => {
	const mockLogger = createMockLogger()
	const adapter = new PinoEsAdapter(mockLogger as unknown as Logger)

	it('should call debug with args and message', () => {
		adapter.debug('test message', {
			key: 'value',
		})

		expect(mockLogger.debug).toHaveBeenCalledWith(
			{
				key: 'value',
			},
			'test message',
		)
	})

	it('should call debug with empty object when no args', () => {
		adapter.debug('test message')

		expect(mockLogger.debug).toHaveBeenCalledWith({}, 'test message')
	})

	it('should call info with args and message', () => {
		adapter.info('info message', {
			data: 123,
		})

		expect(mockLogger.info).toHaveBeenCalledWith(
			{
				data: 123,
			},
			'info message',
		)
	})

	it('should call warn with args and message', () => {
		adapter.warn('warn message', {
			remaining: 5,
		})

		expect(mockLogger.warn).toHaveBeenCalledWith(
			{
				remaining: 5,
			},
			'warn message',
		)
	})

	it('should call error with args and message', () => {
		adapter.error('error message', {
			code: 'ERR',
		})

		expect(mockLogger.error).toHaveBeenCalledWith(
			{
				code: 'ERR',
			},
			'error message',
		)
	})

	it('should default args to an empty object when omitted', () => {
		adapter.debug('debug message')
		adapter.info('info message')
		adapter.warn('warn message')
		adapter.error('error message')

		expect(mockLogger.debug).toHaveBeenCalledWith({}, 'debug message')
		expect(mockLogger.info).toHaveBeenCalledWith({}, 'info message')
		expect(mockLogger.warn).toHaveBeenCalledWith({}, 'warn message')
		expect(mockLogger.error).toHaveBeenCalledWith({}, 'error message')
	})
})
