import { ConsoleLogger, Inject, Injectable, Optional } from '@nestjs/common'

import type { ILoggerAdapter } from '@/logger.adapter.interface.js'
import { LOGGER_ADAPTER } from '@/logger.constants.js'

@Injectable()
export class LoggerService extends ConsoleLogger {
	private readonly _adapter?: ILoggerAdapter

	constructor(
		@Optional()
		@Inject(LOGGER_ADAPTER)
		adapterOrContext?: ILoggerAdapter | string,
	) {
		if (typeof adapterOrContext === 'string') {
			super(adapterOrContext)
		} else {
			super()
			this._adapter = adapterOrContext
		}
	}

	debug(message: string, args?: unknown): void {
		super.debug(message, args)
		this._adapter?.debug(message, args)
	}

	error(message: string, args?: unknown): void {
		super.error(message, args)
		this._adapter?.error(message, args)
	}

	info(message: string, args?: unknown): void {
		this.log(message, args)
	}

	log(message: string, args?: unknown): void {
		super.log(message, args)
		this._adapter?.info(message, args)
	}

	warn(message: string, args?: unknown): void {
		super.warn(message, args)
		this._adapter?.warn(message, args)
	}
}
