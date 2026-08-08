import { ConsoleLogger, Inject, Injectable, Optional } from '@nestjs/common'

import type { ILoggerAdapter } from '@/logger.adapter.interface.js'
import { LOGGER_ADAPTER } from '@/logger.constants.js'
import { withLogContext } from '@/logger.context.js'

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
		const enriched = withLogContext(args)
		super.debug(message, enriched)
		this._adapter?.debug(message, enriched)
	}

	error(message: string, args?: unknown): void {
		const enriched = withLogContext(args)
		super.error(message, enriched)
		this._adapter?.error(message, enriched)
	}

	info(message: string, args?: unknown): void {
		this.log(message, args)
	}

	log(message: string, args?: unknown): void {
		const enriched = withLogContext(args)
		super.log(message, enriched)
		this._adapter?.info(message, enriched)
	}

	warn(message: string, args?: unknown): void {
		const enriched = withLogContext(args)
		super.warn(message, enriched)
		this._adapter?.warn(message, enriched)
	}
}
