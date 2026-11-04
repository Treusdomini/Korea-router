// Storage layer for the link mappings.
//
// Primary store: Vercel KV (Redis) when KV_REST_API_URL / KV_REST_API_TOKEN
// are configured (e.g. on Vercel with the KV integration).
//
// Fallback: an in-memory store so the app still boots and works in dev /
// self-hosted environments without KV. Data in the fallback lives only for
// the lifetime of the server process.

type KvLike = {
  get: <T>(key: string) => Promise<T | null>
  set: (key: string, value: unknown) => Promise<unknown>
  del: (key: string) => Promise<unknown>
  sadd: (key: string, member: string) => Promise<unknown>
  srem: (key: string, member: string) => Promise<unknown>
  smembers: (key: string) => Promise<string[]>
}

let vercelKv: KvLike | null = null
let warnedAboutFallback = false

async function getKv(): Promise<KvLike> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    if (!vercelKv) {
      // Imported lazily: @vercel/kv throws at import time when the env vars
      // above are missing, so it must never be loaded in fallback mode.
      const mod = await import('@vercel/kv')
      vercelKv = mod.kv as unknown as KvLike
    }
    return vercelKv
  }

  if (!warnedAboutFallback) {
    warnedAboutFallback = true
    console.warn(
      '[kv] KV_REST_API_URL / KV_REST_API_TOKEN not set — using in-memory store (data is lost on restart).'
    )
  }
  return memoryKv
}

const memoryStore = new Map<string, unknown>()
const memorySets = new Map<string, Set<string>>()

const memoryKv: KvLike = {
  async get<T>(key: string): Promise<T | null> {
    return (memoryStore.has(key) ? (memoryStore.get(key) as T) : null)
  },
  async set(key: string, value: unknown) {
    memoryStore.set(key, value)
  },
  async del(key: string) {
    memoryStore.delete(key)
    memorySets.forEach((set) => set.delete(key))
  },
  async sadd(key: string, member: string) {
    if (!memorySets.has(key)) memorySets.set(key, new Set())
    memorySets.get(key)!.add(member)
  },
  async srem(key: string, member: string) {
    memorySets.get(key)?.delete(member)
  },
  async smembers(key: string) {
    return Array.from(memorySets.get(key) ?? [])
  },
}

export const kv: KvLike = {
  get: <T>(key: string) => getKv().then((k) => k.get<T>(key)),
  set: (key: string, value: unknown) => getKv().then((k) => k.set(key, value)),
  del: (key: string) => getKv().then((k) => k.del(key)),
  sadd: (key: string, member: string) => getKv().then((k) => k.sadd(key, member)),
  srem: (key: string, member: string) => getKv().then((k) => k.srem(key, member)),
  smembers: (key: string) => getKv().then((k) => k.smembers(key)),
}
