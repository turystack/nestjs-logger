import type { FactoryProvider, Provider } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ConfigModule } from '@turystack/nestjs-config'
import pino from 'pino'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { LOGGER_ADAPTER, LOGGER_ADAPTER_PINO_ES } from '@/logger.constants.js'
import { LoggerModule } from '@/logger.module.js'
import { LoggerService } from '@/logger.service.js'

import { PinoEsAdapter } from '@/pino-es/pino-es.adapter.js'

vi.mock('pino', () => ({
	default: vi.fn(() => ({})),
}))

const findProvider = (providers: Provider[], token: unknown) =>
	providers.find(
		(provider) =>
			typeof provider === 'object' &&
			'provide' in provider &&
			provider.provide === token,
	)

describe('LoggerModule', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.unstubAllEnvs()
	})

	describe('register', () => {
		it('should expose LoggerService globally and bind the pino-es adapter', () => {
			const dynamicModule = LoggerModule.register({
				adapter: 'elasticsearch',
				elasticsearch: {
					node: 'http://localhost:9200',
				},
			})

			expect(dynamicModule.module).toBe(LoggerModule)
			expect(dynamicModule.global).toBe(true)
			expect(dynamicModule.exports).toEqual([
				LoggerService,
			])

			const providers = dynamicModule.providers ?? []
			expect(providers).toContain(LoggerService)
			expect(findProvider(providers, LOGGER_ADAPTER)).toMatchObject({
				useClass: PinoEsAdapter,
			})
			expect(findProvider(providers, LOGGER_ADAPTER_PINO_ES)).toBeDefined()
		})

		it('should create the pino logger with defaults', () => {
			const dynamicModule = LoggerModule.register({
				adapter: 'elasticsearch',
				elasticsearch: {
					node: 'http://localhost:9200',
				},
			})

			const pinoProvider = findProvider(
				dynamicModule.providers ?? [],
				LOGGER_ADAPTER_PINO_ES,
			) as FactoryProvider

			pinoProvider.useFactory({
				adapter: 'elasticsearch',
				elasticsearch: {
					node: 'http://localhost:9200',
				},
			})

			expect(pino).toHaveBeenCalledWith({
				level: 'info',
				transport: {
					targets: [
						{
							level: 'info',
							options: {
								auth: undefined,
								node: 'http://localhost:9200',
							},
							target: 'pino-elasticsearch',
						},
					],
				},
			})
		})

		it('should create the pino logger with a custom level and api key', () => {
			const dynamicModule = LoggerModule.register({
				adapter: 'elasticsearch',
				elasticsearch: {
					apiKey: 'secret',
					node: 'http://localhost:9200',
				},
				level: 'debug',
			})

			const pinoProvider = findProvider(
				dynamicModule.providers ?? [],
				LOGGER_ADAPTER_PINO_ES,
			) as FactoryProvider

			pinoProvider.useFactory({
				adapter: 'elasticsearch',
				elasticsearch: {
					apiKey: 'secret',
					node: 'http://localhost:9200',
				},
				level: 'debug',
			})

			expect(pino).toHaveBeenCalledWith(
				expect.objectContaining({
					level: 'debug',
					transport: {
						targets: [
							expect.objectContaining({
								level: 'debug',
								options: {
									auth: {
										apiKey: 'secret',
									},
									node: 'http://localhost:9200',
								},
							}),
						],
					},
				}),
			)
		})

		it('should resolve options from a config factory', async () => {
			vi.stubEnv('ELASTICSEARCH_NODE', 'http://localhost:9200')

			const moduleRef = await Test.createTestingModule({
				imports: [
					ConfigModule.register({
						envFilePath: false,
						schema: {
							ELASTICSEARCH_NODE: z.string(),
						},
					}),
					LoggerModule.register((config) => ({
						adapter: 'elasticsearch',
						elasticsearch: {
							node: config.get('ELASTICSEARCH_NODE') as string,
						},
					})),
				],
			}).compile()

			expect(moduleRef.get(LoggerService)).toBeInstanceOf(LoggerService)
			expect(pino).toHaveBeenCalledWith(
				expect.objectContaining({
					transport: {
						targets: [
							expect.objectContaining({
								options: {
									auth: undefined,
									node: 'http://localhost:9200',
								},
							}),
						],
					},
				}),
			)
		})

		it('should reject a config factory without ConfigModule', async () => {
			await expect(
				Test.createTestingModule({
					imports: [
						LoggerModule.register((config) => ({
							adapter: 'elasticsearch',
							elasticsearch: {
								node: config.get('ELASTICSEARCH_NODE') as string,
							},
						})),
					],
				}).compile(),
			).rejects.toThrow(
				'requires ConfigModule (@turystack/nestjs-config) to be registered',
			)
		})
	})
})
