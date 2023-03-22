import fastify, { FastifyInstance } from 'fastify'
import { BaseRouter } from './base-router'
import cors from '@fastify/cors'
import { Logger } from '@book000/node-utils'
import { MainEndPoint } from './endpoint'

/**
 * Fastify アプリケーションを構築する
 *
 * @returns Fastify アプリケーション
 */
export function buildApp(): FastifyInstance {
  const logger = Logger.configure('buildApp')

  const app = fastify()
  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })

  // routers
  const routers: BaseRouter[] = [new MainEndPoint(app)]

  for (const router of routers) {
    logger.info(`⏩ Initializing route: ${router.constructor.name}`)
    router.init()
  }

  return app
}
