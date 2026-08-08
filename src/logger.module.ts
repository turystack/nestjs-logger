import { type DynamicModule, Global, Module } from '@nestjs/common'
import { ConfigService } from '@turystack/nestjs-config'

import { LOGGER_MODULE_OPTIONS } from '@/logger.constants.js'
import { LoggerService } from '@/logger.service.js'
import type { LoggerModuleOptions } from '@/logger.types.js'

import { PinoElasticsearchModule } from '@/pino-es/index.js'

@Global()
@Module({
	exports: [
		LoggerService,
	],
	providers: [
		LoggerService,
	],
})
export class LoggerModule {
	static register(
		options:
			| LoggerModuleOptions
			| ((config: ConfigService) => LoggerModuleOptions),
	): DynamicModule {
		return {
			exports: [
				LoggerService,
			],
			global: true,
			module: LoggerModule,
			providers: [
				{
					inject: [
						{
							optional: true,
							token: ConfigService,
						},
					],
					provide: LOGGER_MODULE_OPTIONS,
					useFactory: (config?: ConfigService) =>
						LoggerModule._resolveOptions(options, config),
				},
				...PinoElasticsearchModule.createProviders(),
				LoggerService,
			],
		}
	}

	private static _resolveOptions(
		options:
			| LoggerModuleOptions
			| ((config: ConfigService) => LoggerModuleOptions),
		config?: ConfigService,
	): LoggerModuleOptions {
		if (typeof options !== 'function') {
			return options
		}

		if (!config) {
			throw new Error(
				'[LoggerModule] register((config) => ...) requires ConfigModule (@turystack/nestjs-config) to be registered',
			)
		}

		return options(config)
	}
}
