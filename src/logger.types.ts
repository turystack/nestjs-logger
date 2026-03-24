export interface LogMetadata {
	[key: string]: unknown
}

export type LoggerModuleOptions = {
	adapter: 'elasticsearch'
	elasticsearch: {
		apiKey?: string
		node: string
	}
	level?: 'debug' | 'error' | 'info' | 'warn'
}
