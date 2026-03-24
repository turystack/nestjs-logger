import { Inject, Injectable } from '@nestjs/common'
import type { Logger } from 'pino'

import type { ILoggerAdapter } from '@/logger.adapter.interface.js'
import { LOGGER_ADAPTER_PINO_ES } from '@/logger.constants.js'

@Injectable()
export class PinoEsAdapter implements ILoggerAdapter {
  private readonly _logger: Logger

  constructor(@Inject(LOGGER_ADAPTER_PINO_ES) logger: Logger) {
    this._logger = logger
  }

  debug(message: string, args?: unknown): void {
    this._logger.debug(args ?? {}, message)
  }

  error(message: string, args?: unknown): void {
    this._logger.error(args ?? {}, message)
  }

  info(message: string, args?: unknown): void {
    this._logger.info(args ?? {}, message)
  }

  warn(message: string, args?: unknown): void {
    this._logger.warn(args ?? {}, message)
  }
}
