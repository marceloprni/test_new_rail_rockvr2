import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { users } from './routes/user'
import { meals } from './routes/meal'

export const app = fastify()

app.register(cookie)
app.register(users, {
  prefix: 'users',
})

app.register(meals, {
  prefix: 'meals',
})
