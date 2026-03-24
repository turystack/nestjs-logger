import type { Provider } from '@nestjs/common'
import pino from 'pino'

import { LOGGER_ADAPTER, LOGGER_ADAPTER_PINO_ES } from '@/logger.constants.js'
import type { LoggerModuleOptions } from '@/logger.types.js'

import { PinoEsAdapter } from '@/pino-es/pino-es.adapter.js'

export class PinoElasticsearchModule {
	static createProviders(options: LoggerModuleOptions): Provider[] {
		return [
			{
				provide: LOGGER_ADAPTER_PINO_ES,
				useFactory: () => {
					return pino({
						level: options.level ?? 'info',
						transport: {
							targets: [
								{
									level: options.level ?? 'info',
									options: {
										auth: options.elasticsearch.apiKey
											? {
													apiKey: options.elasticsearch.apiKey,
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
