import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function memoriesRoutes(app: FastifyInstance) {
  // verifica se pessoa usuária está logado (possui token válido e dentro do prazo)
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/memories', async (request) => {
    const memories = await prisma.memories.findMany({
      where: {
        userId: request.user.sub, // retorna apenas as memórias da pessoa usuária
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
      }
    })
  })

  app.get('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memories.findUniqueOrThrow({
      where: {
        id,
      },
    })

    // caso a memória seja privada, verifica se a pessoa usuária atrelada a essa memória é a mesma que está solicitando GET, caso contrário, retorna erro 401
    if (!memory.isPublic && memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    return memory
  })

  app.post('/memories', async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const memory = await prisma.memories.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub, // memória cadastrada será vinculada a pessoa usuária que cadastrou
      },
    })

    return memory
  })

  app.put('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    // tenta encontrar a memória indicada pelo id, caso contrário, retorna erro
    let memory = await prisma.memories.findUniqueOrThrow({ where: { id } })

    // verifica se pessoa usuária atrelada a memória é a que está solicitando atualização, caso contrário, retorna erro 401
    if (memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    memory = await prisma.memories.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return memory
  })

  app.delete('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    // tenta encontrar a memória indicada pelo id, caso contrário, retorna erro
    const memory = await prisma.memories.findUniqueOrThrow({ where: { id } })

    // verifica se pessoa usuária atrelada a memória é a que está solicitando remoção, caso contrário, retorna erro 401
    if (memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    await prisma.memories.delete({
      where: {
        id,
      },
    })
  })
}
