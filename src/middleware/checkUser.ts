import { FastifyReply, FastifyRequest } from 'fastify'

export async function userSessionIdExists(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const userId = req.cookies.userId
  console.log(userId)
  if (!userId) {
    return res.status(401).send({
      error: 'Unauthorized.',
    })
  }
}
