let lastTraceId: string | null = null;

function generateHex(bytes: number): string {
  const array = new Uint8Array(bytes);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateTraceId(): string {
  return generateHex(16);
}

export function generateSpanId(): string {
  return generateHex(8);
}

export function formatTraceparent(traceId: string, spanId: string): string {
  return `00-${traceId}-${spanId}-01`;
}

export function parseTraceparent(traceparent: string): {
  traceId: string;
  spanId: string;
} | null {
  const parts = traceparent.split("-");
  if (parts.length !== 4 || parts[0] !== "00") {
    return null;
  }
  return {
    traceId: parts[1],
    spanId: parts[2],
  };
}

export function getOrCreateTraceparent(): string {
  const traceId = lastTraceId || generateTraceId();
  const spanId = generateSpanId();
  return formatTraceparent(traceId, spanId);
}

export function updateLastTraceId(traceparent: string | null): void {
  if (!traceparent) return;

  const parsed = parseTraceparent(traceparent);
  if (parsed) {
    lastTraceId = parsed.traceId;
  }
}

export function getLastTraceId(): string | null {
  return lastTraceId;
}
