import type { Provider } from '@nestjs/common'
import pino from 'pino'

import {
	LOGGER_ADAPTER,
	LOGGER_ADAPTER_PINO_ES,
	LOGGER_MODULE_OPTIONS,
} from '@/logger.constants.js'
import type { LoggerModuleOptions } from '@/logger.types.js'

import { PinoEsAdapter } from '@/pino-es/pino-es.adapter.js'

const resolveAuth = (elasticsearch: LoggerModuleOptions['elasticsearch']) => {
	if (elasticsearch.apiKey) {
		return {
			apiKey: elasticsearch.apiKey,
		}
	}

	if (elasticsearch.username && elasticsearch.password) {
		return {
			password: elasticsearch.password,
			username: elasticsearch.username,
		}
	}

	return undefined
}

export class PinoElasticsearchModule {
	static createProviders(): Provider[] {
		return [
			{
				inject: [
					LOGGER_MODULE_OPTIONS,
				],
				provide: LOGGER_ADAPTER_PINO_ES,
				useFactory: (options: LoggerModuleOptions) => {
					return pino({
						level: options.level ?? 'info',
						transport: {
							targets: [
								{
									level: options.level ?? 'info',
									options: {
										auth: resolveAuth(options.elasticsearch),
										cloud: options.elasticsearch.cloudId
											? {
													id: options.elasticsearch.cloudId,
												}
											: undefined,
										node: options.elasticsearch.node,
									},
									target: 'pino-elasticsearch',
								},
							],
						},
					})
				},
			},
			{
				provide: LOGGER_ADAPTER,
				useClass: PinoEsAdapter,
			},
		]
	}
}
