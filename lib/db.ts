import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

type Db = ReturnType<typeof drizzle<typeof schema>>

let _db: Db | undefined

function getDb(): Db {
  if (!_db) {
    _db = drizzle(neon(process.env.DATABASE_URL!), { schema })
  }
  return _db
}

// Proxy defers neon() until the first real query, so importing this
// module in Edge Runtime or middleware contexts won't throw if
// DATABASE_URL isn't resolved yet at module evaluation time.
export const db = new Proxy({} as Db, {
  get(_, prop) {
    const instance = getDb()
    const value = Reflect.get(instance, prop)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
