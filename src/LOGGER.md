# Logger

Global logging module extending NestJS `ConsoleLogger` with optional Elasticsearch integration via Pino.

## Setup

### Basic (ConsoleLogger only)

```ts
import { LoggerModule } from 'aw-backend/logger'

@Module({
  imports: [LoggerModule], // @Global — available everywhere
})
export class AppModule {}
```

No `.register()` needed — uses NestJS `ConsoleLogger` out of the box.

### With Elasticsearch

```ts
import { LoggerModule } from 'aw-backend/logger'

@Module({
  imports: [
    LoggerModule.register({
      adapter: 'elasticsearch',
      elasticsearch: {
        node: process.env.ELASTICSEARCH_URL,
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD,
      },
    }),
  ],
})
export class AppModule {}
```

When `register()` is called, logs are sent to **both** `ConsoleLogger` and Elasticsearch (via Pino transport).

### LoggerModuleOptions

| Property | Type | Required | Description |
|---|---|---|---|
| `adapter` | `'elasticsearch'` | Yes | Adapter to use |
| `elasticsearch.node` | `string` | No | Elasticsearch URL (e.g. `http://localhost:9200`) |
| `elasticsearch.cloudId` | `string` | No | Elastic Cloud ID |
| `elasticsearch.username` | `string` | No | Basic auth username |
| `elasticsearch.password` | `string` | No | Basic auth password |
| `level` | `'debug' \| 'info' \| 'warn' \| 'error'` | No | Log level for Elasticsearch transport (default: `'info'`) |

## LoggerService

```ts
import { LoggerService } from 'aw-backend/logger'

class MyService {
  constructor(private readonly logger: LoggerService) {}

  example() {
    this.logger.info('User created', { userId: '123', action: 'create' })
    this.logger.debug('Processing', { step: 1 })
    this.logger.warn('Rate limit approaching', { remaining: 5 })
    this.logger.error('Payment failed', { code: 'DECLINED', orderId: '456' })
  }
}
```

### Methods

| Method | Signature | Description |
|---|---|---|
| `info` | `info(message: string, args?: unknown): void` | Log info (calls `ConsoleLogger.log`) |
| `log` | `log(message: string, args?: unknown): void` | Alias for `info` (NestJS compatibility) |
| `debug` | `debug(message: string, args?: unknown): void` | Log debug |
| `warn` | `warn(message: string, args?: unknown): void` | Log warning |
| `error` | `error(message: string, args?: unknown): void` | Log error |

### Named loggers

For use outside of DI (e.g. bootstrap factories):

```ts
const logger = new LoggerService('MyContext')
logger.info('hello') // [MyContext] hello
```

This uses `ConsoleLogger` only (no Elasticsearch adapter).

## Architecture

```
LoggerService (extends ConsoleLogger)
  ├── ConsoleLogger  ← always active
  └── PinoEsAdapter  ← only when register() with adapter: 'elasticsearch'
        └── pino → pino-elasticsearch transport
```

## Peer dependencies

| Package | Version | When needed |
|---|---|---|
| `pino` | `^9.0.0` | With `adapter: 'elasticsearch'` |
| `pino-elasticsearch` | `^8.0.0` | With `adapter: 'elasticsearch'` |

## Types

```ts
interface LogMetadata {
  [key: string]: unknown
}
```
