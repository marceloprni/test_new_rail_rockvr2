import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { userSessionIdExists } from '../middleware/checkUser'

async function meals(app: FastifyInstance) {
  app.get(
    '/metrics/:userId',
    { preHandler: [userSessionIdExists] },
    async (req, res) => {
      const metricsMeal = z.object({
        userId: z.string().uuid(),
      })

      const { userId } = metricsMeal.parse(req.params)

      const totalMealsOnDiet = await knex('refeicao')
        .where({ user_id: userId })
        .count('id', { as: 'total' })
        .first()

      const totalMealDietOn = await knex('refeicao')
        .where({ dieta: true })
        .count('dieta', { as: 'total' })
        .first()

      const totalMealDietOff = await knex('refeicao')
        .where({ dieta: false })
        .count('dieta', { as: 'total' })
        .first()

      const totalMeals = await knex('refeicao')
        .where({ user_id: userId })
        .select()

      const bestSequence = totalMeals.reduce(
        (acc, meals) => {
          if (meals.dieta) {
            acc.currentSequence += 1
          } else {
            acc.currentSequence = 0
          }

          if (acc.currentSequence > acc.bestOnDietSequence) {
            acc.bestOnDietSequence = acc.currentSequence
          }

          return acc
        },
        {
          bestOnDietSequence: 0,
          currentSequence: 0,
        },
      )

      const listAll = {
        totalMealsOnDietList: totalMealsOnDiet,
        totalMealDietaOnList: totalMealDietOn,
        totalMealDietaOffList: totalMealDietOff,
        Sequence: bestSequence,
      }

      return res.status(201).send(listAll)
    },
  )

  app.get(
    '/uniqueMeal/:id',
    { preHandler: [userSessionIdExists] },
    async (req, res) => {
      const selectAllMeal = z.object({
        id: z.string().uuid(),
      })

      const { id } = selectAllMeal.parse(req.params)
      console.log(id)
      const listMeal = await knex('refeicao').where('id', id).select()

      if (!listMeal.length) {
        return res.status(401).send({
          error: 'Nothing in the list.',
        })
      }

      return res.status(201).send(listMeal)
    },
  )

  app.get(
    '/allMeals/:userid',
    { preHandler: [userSessionIdExists] },
    async (req, res) => {
      const selectAllMeal = z.object({
        userid: z.string().uuid(),
      })

      const { userid } = selectAllMeal.parse(req.params)
      const listMeal = await knex('refeicao').where('user_id', userid).select()

      if (!listMeal.length) {
        return res.status(401).send({
          error: 'Nothing in the list.',
        })
      }

      return res.status(201).send(listMeal)
    },
  )

  app.delete(
    '/:id',
    { preHandler: [userSessionIdExists] },
    async (req, res) => {
      const deleteMeal = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteMeal.parse(req.params)

      await knex('refeicao').where('id', id).del()
      return res.status(201).send('Deleted Successfully')
    },
  )

  app.put('/', { preHandler: [userSessionIdExists] }, async (req, res) => {
    const changeMeal = z.object({
      idMeal: z.string().uuid(),
      descriptionInformation: z.string(),
      dietaInformation: z.boolean(),
    })

    const { idMeal, descriptionInformation, dietaInformation } =
      changeMeal.parse(req.body)

    let verifyData
    if (!idMeal) {
      return res.status(401).send({
        error: 'Not id.',
      })
    } else {
      verifyData = await knex('refeicao').select().where('id', idMeal)
    }

    for (const i in verifyData) {
      if (verifyData[i].refeicao !== descriptionInformation) {
        verifyData[i].refeicao = descriptionInformation
      }

      const dietaVerify =
        verifyData[i].dieta == 0
          ? (verifyData[i].dieta = false)
          : (verifyData[i].dieta = true)

      if (dietaVerify !== dietaInformation) {
        verifyData[i].dieta = dietaInformation
      }
    }

    console.log(verifyData)
    await knex('refeicao').where({ id: idMeal }).update({
      refeicao: verifyData[0].refeicao,
      created_at: knex.fn.now(),
      dieta: verifyData[0].dieta,
    })

    return res.status(201).send()
  })

  app.post('/', { preHandler: [userSessionIdExists] }, async (req, res) => {
    const createMeal = z.object({
      descriptionInformation: z.string(),
      dietaInformation: z.boolean(),
    })

    const { descriptionInformation, dietaInformation } = createMeal.parse(
      req.body,
    )

    const { userId } = req.cookies
    console.log(userId)
    let idUsuario
    if (userId) {
      console.log('ika nda')
      idUsuario = await knex('user')
        .select()
        .where('usersession_id', userId)
        .first()
    } else {
      return res.status(401).send({
        error: 'Unauthorized.',
      })
    }

    await knex('refeicao').insert({
      id: randomUUID(),
      refeicao: descriptionInformation,
      dieta: dietaInformation,
      user_id: idUsuario.id,
    })

    return res.status(201).send()
  })
}

export { meals }
