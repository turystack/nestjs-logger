import { Injectable, Module } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { describe, expect, it, vi } from 'vitest'

import { LOGGER_ADAPTER_PINO_ES } from '@/logger.constants.js'
import { LoggerModule } from '@/logger.module.js'
import { LoggerService } from '@/logger.service.js'

vi.mock('pino', () => ({
	default: vi.fn(() => ({})),
}))

@Injectable()
class DomainService {
	constructor(public readonly logger: LoggerService) {}
}

@Module({
	providers: [
		DomainService,
	],
})
class DomainLibModule {}

describe('LoggerModule (integration)', () => {
	it('should share the app-wide LoggerService with domain libs', async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				LoggerModule.register({
					adapter: 'elasticsearch',
					elasticsearch: {
						node: 'http://localhost:9200',
					},
				}),
				DomainLibModule,
			],
		})
			.overrideProvider(LOGGER_ADAPTER_PINO_ES)
			.useValue({})
			.compile()

		const domainService = moduleRef.get(DomainService)
		expect(domainService.logger).toBeInstanceOf(LoggerService)
		expect(domainService.logger).toBe(moduleRef.get(LoggerService))
	})
})
