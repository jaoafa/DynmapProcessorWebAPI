import { Logger } from '@book000/node-utils'
import { DynmapProcessor } from './dynmap-processor'
import { buildApp } from './server'

async function main() {
  const logger = Logger.configure('main')
  const host = process.env.API_HOST || '0.0.0.0'
  const port = process.env.API_PORT
    ? Number.parseInt(process.env.API_PORT, 10)
    : 8000

  const dp = new DynmapProcessor()
  await dp.init()

  const app = buildApp()
  app.listen({ host, port }, (error, address) => {
    if (error) {
      logger.error('❌ Fastify.listen error', error)
    }
    logger.info(`✅ API Server listening at ${address}`)
  })
}

;(async () => {
  main()
})()
