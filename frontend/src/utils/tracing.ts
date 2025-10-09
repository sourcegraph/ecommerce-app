function generateHex(length: number): string {
  const bytes = new Uint8Array(length / 2)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

function generateTraceId(): string {
  return generateHex(32)
}

function generateSpanId(): string {
  return generateHex(16)
}

export function makeTraceparent(traceId?: string, spanId?: string): string {
  const trace = traceId || generateTraceId()
  const span = spanId || generateSpanId()
  return `00-${trace}-${span}-01`
}

export function parseTraceparent(traceparent: string): { traceId: string; spanId: string } | null {
  const match = /^00-([0-9a-f]{32})-([0-9a-f]{16})-[0-9a-f]{2}$/.exec(traceparent)
  if (match) {
    return { traceId: match[1], spanId: match[2] }
  }
  return null
}

let currentTraceparent: string | null = null
let lastRequestId: string | null = null

export function getTraceparent(): string {
  if (!currentTraceparent) {
    currentTraceparent = makeTraceparent()
  }
  return currentTraceparent
}

export function updateTraceparent(traceparent: string): void {
  currentTraceparent = traceparent
}

export function getLastRequestId(): string | null {
  return lastRequestId
}

export function updateLastRequestId(requestId: string): void {
  lastRequestId = requestId
}
