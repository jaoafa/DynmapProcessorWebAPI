import { FastifyReply, FastifyRequest } from 'fastify'
import { BaseRouter } from './base-router'
import { DynmapProcessor } from './dynmap-processor'

export class MainEndPoint extends BaseRouter {
  init(): void {
    this.fastify.register((fastify, _, done) => {
      fastify.get('/', this.routeGet.bind(this))
      done()
    })
  }

  async routeGet(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dp = new DynmapProcessor()
    await dp.init()
    await reply.send('Hello, world!')
  }
}
