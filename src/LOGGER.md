# Logger

Structured logging module with Pino and pluggable transport adapters — Elasticsearch is the built-in option. `LoggerService` extends the NestJS `ConsoleLogger`, so every log goes to the console and to the configured transport.

## Setup

Register once in the app root — the module is global, so domain services in monorepo libs just inject `LoggerService` without importing anything.

```ts
import { ConfigModule, defineConfigSchema } from '@turystack/nestjs-config'
import { LoggerModule } from '@turystack/nestjs-logger'
import { z } from 'zod'

export const configSchema = defineConfigSchema({
  ELASTICSEARCH_API_KEY: z.string().optional(),
  ELASTICSEARCH_NODE: z.string(),
})

declare module '@turystack/nestjs-config' {
  interface ConfigSchemaRegistry {
    schema: typeof configSchema
  }
}

@Module({
  imports: [
    ConfigModule.register({ schema: configSchema }),
    LoggerModule.register((config) => ({
      adapter: 'elasticsearch',
      elasticsearch: {
        apiKey: config.get('ELASTICSEARCH_API_KEY'),
        node: config.get('ELASTICSEARCH_NODE'),
      },
      level: 'info',
    })),
  ],
})
class AppModule {}
```

`register` also accepts a plain options object; the `(config) => options` form injects the `ConfigService` from `@turystack/nestjs-config` at boot.

## LoggerService

Injectable service available after module registration.

```ts
import { LoggerService } from '@turystack/nestjs-logger'

class PaymentsService {
  constructor(private readonly logger: LoggerService) {}

  async charge(userId: string) {
    this.logger.info('charging user', { userId })
  }
}
```

### Methods

| Method | Signature | Description |
|---|---|---|
| `debug` | `debug(message: string, args?: unknown): void` | Debug-level log |
| `error` | `error(message: string, args?: unknown): void` | Error-level log |
| `info` | `info(message: string, args?: unknown): void` | Info-level log (alias of `log`) |
| `log` | `log(message: string, args?: unknown): void` | Info-level log |
| `warn` | `warn(message: string, args?: unknown): void` | Warn-level log |

## Types

```ts
type LoggerModuleOptions = {
  adapter: 'elasticsearch'
  elasticsearch: {
    apiKey?: string   // Optional API key auth
    node: string      // Elasticsearch node URL
  }
  level?: 'debug' | 'error' | 'info' | 'warn' // Default: 'info'
}

interface LogMetadata {
  [key: string]: unknown
}
```
