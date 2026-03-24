import { type DynamicModule, Global, Module, type Provider } from '@nestjs/common'
import pino from 'pino'

import {
  LOGGER_ADAPTER,
  LOGGER_ADAPTER_PINO_ES,
} from '@/logger.constants.js'
import { LoggerService } from '@/logger.service.js'
import type { LoggerModuleOptions } from '@/logger.types.js'
import { PinoEsAdapter } from '@/pino-es/index.js'

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
        ...LoggerModule._resolveProviders(options),
        LoggerService,
      ],
    }
  }

  private static _resolveProviders(
    options: LoggerModuleOptions,
  ): Provider[] {
    switch (options.adapter) {
      case 'elasticsearch':
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
                        auth: options.elasticsearch.username
                          ? {
                              password: options.elasticsearch.password,
                              username: options.elasticsearch.username,
                            }
                          : undefined,
                        cloud: options.elasticsearch.cloudId
                          ? { id: options.elasticsearch.cloudId }
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
          { provide: LOGGER_ADAPTER, useClass: PinoEsAdapter },
        ]
    }
  }
}
