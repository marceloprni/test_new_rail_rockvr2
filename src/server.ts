import fastify from 'fastify'

const app = fastify()

app.get('/api', () => {
  return 'hello'
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('listening on port')
  })
