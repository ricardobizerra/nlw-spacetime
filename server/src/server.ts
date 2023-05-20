import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt, { Secret } from '@fastify/jwt'
import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'

const app = fastify()

app.register(cors, {
  origin: true,
})
app.register(jwt, {
  secret: process.env.JWT_SECRET as Secret,
})

app.register(authRoutes)
app.register(memoriesRoutes)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log(`✅ Server running on http://localhost:3333`)
  })
