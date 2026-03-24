import { type DynamicModule, Global, Module } from '@nestjs/common'

import { LoggerService } from '@/logger.service.js'
import type { LoggerModuleOptions } from '@/logger.types.js'
import { PinoElasticsearchModule } from '@/pino-es/index.js'

@Global()
@Module({
	exports: [LoggerService],
	providers: [LoggerService],
})
export class LoggerModule {
	static register(options: LoggerModuleOptions): DynamicModule {
		return {
			exports: [LoggerService],
			global: true,
			module: LoggerModule,
			providers: [
				...PinoElasticsearchModule.createProviders(options),
				LoggerService,
			],
		}
	}
}
