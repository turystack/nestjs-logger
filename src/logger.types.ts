export interface LogMetadata {
  [key: string]: unknown
}

export type LoggerModuleOptions = {
  adapter: 'elasticsearch'
  elasticsearch: {
    cloudId?: string
    node?: string
    password?: string
    username?: string
  }
  level?: 'debug' | 'error' | 'info' | 'warn'
}
