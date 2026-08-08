/** Supplies fields to attach to every log line of the operation in flight. */
export type LogContextReader = () => Record<string, unknown> | undefined

let reader: LogContextReader | undefined

/**
 * Registers the source of per-operation log fields — a correlation id, the
 * acting principal, the tenant.
 *
 * Inverted on purpose: the logger knows nothing about
 * `@turystack/nestjs-context`, and the context package pushes the reader in.
 * A direct dependency either way would be a cycle, and an optional peer would
 * have to be imported asynchronously — which these synchronous methods cannot
 * await.
 */
export function registerLogContext(next: LogContextReader | undefined): void {
	reader = next
}

/**
 * Merges the ambient fields under `context`, without letting them overwrite
 * what the caller passed: an explicit argument is always more specific.
 */
export function withLogContext(args?: unknown): unknown {
	const ambient = reader?.()

	if (!ambient || Object.keys(ambient).length === 0) {
		return args
	}

	if (args === undefined) {
		return ambient
	}

	if (typeof args !== 'object' || args === null || Array.isArray(args)) {
		return {
			...ambient,
			value: args,
		}
	}

	return {
		...ambient,
		...(args as Record<string, unknown>),
	}
}
