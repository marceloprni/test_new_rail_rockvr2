import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { userSessionIdExists } from '../middleware/checkUser'

async function users(app: FastifyInstance) {
  app.addHook('preHandler', async (req, res) => {
    console.log(`[${req.method}]-${req.url}`)
  })

  app.get('/', { preHandler: [userSessionIdExists] }, async (req, res) => {
    const { userId } = req.cookies
    console.log(userId)
    const transactions = await knex('user')
      .where('usersession_id', userId)
      .select()

    return { transactions }
  })

  app.post('/', async (req, res) => {
    const createUser = z.object({
      users: z.string(),
    })

    const { users } = createUser.parse(req.body)
    console.log(users)

    let userId = req.cookies.userId
    console.log(userId)

    if (!userId) {
      userId = randomUUID()

      res.cookie('userId', userId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    await knex('user').insert({
      id: randomUUID(),
      user: users,
      usersession_id: userId,
    })

    return res.status(201).send()
  })
}

export { users }
