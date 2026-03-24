import { Test } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ILoggerAdapter } from '@/logger.adapter.interface.js'
import { LOGGER_ADAPTER } from '@/logger.constants.js'
import { LoggerService } from '@/logger.service.js'

const createMockAdapter = (): ILoggerAdapter => ({
	debug: vi.fn(),
	error: vi.fn(),
	info: vi.fn(),
	warn: vi.fn(),
})

describe('LoggerService', () => {
	describe('with injected adapter', () => {
		let logger: LoggerService
		let adapter: ILoggerAdapter

		beforeEach(async () => {
			const mockAdapter = createMockAdapter()

			const module = await Test.createTestingModule({
				providers: [
					LoggerService,
					{
						provide: LOGGER_ADAPTER,
						useValue: mockAdapter,
					},
				],
			}).compile()

			logger = module.get(LoggerService)
			adapter = module.get(LOGGER_ADAPTER)
		})

		it('should delegate info to adapter', () => {
			logger.info('hello', {
				key: 'value',
			})

			expect(adapter.info).toHaveBeenCalledWith('hello', {
				key: 'value',
			})
		})

		it('should delegate log to adapter as info', () => {
			logger.log('hello', {
				key: 'value',
			})

			expect(adapter.info).toHaveBeenCalledWith('hello', {
				key: 'value',
			})
		})

		it('should delegate debug to adapter', () => {
			logger.debug('debug msg', {
				foo: 'bar',
			})

			expect(adapter.debug).toHaveBeenCalledWith('debug msg', {
				foo: 'bar',
			})
		})

		it('should delegate warn to adapter', () => {
			logger.warn('watch out', {
				remaining: 5,
			})

			expect(adapter.warn).toHaveBeenCalledWith('watch out', {
				remaining: 5,
			})
		})

		it('should delegate error to adapter', () => {
			logger.error('broken', {
				code: 'ERR',
			})

			expect(adapter.error).toHaveBeenCalledWith('broken', {
				code: 'ERR',
			})
		})

		it('should pass undefined args to adapter', () => {
			logger.info('no args')

			expect(adapter.info).toHaveBeenCalledWith('no args', undefined)
		})
	})

	describe('extends ConsoleLogger', () => {
		it('should be an instance of ConsoleLogger', async () => {
			const { ConsoleLogger } = await import('@nestjs/common')
			const logger = new LoggerService()

			expect(logger).toBeInstanceOf(ConsoleLogger)
		})

		it('should accept context string for ConsoleLogger', () => {
			const logger = new LoggerService('MyContext')

			expect(logger).toBeDefined()
		})
	})

	describe('without adapter (fallback)', () => {
		it('should work without adapter', () => {
			const logger = new LoggerService()

			expect(() => logger.info('test')).not.toThrow()
		})

		it('should work with string context', () => {
			const logger = new LoggerService('Consumer')

			expect(() => logger.info('test')).not.toThrow()
		})
	})
})
