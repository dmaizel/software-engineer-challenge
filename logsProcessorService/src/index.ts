import fastify from 'fastify';
// todo do better import
import { a } from './logsHandler.ts';
import { generateLog } from './mocks/logsGenerator.ts';
console.log('a', a)
console.log('generate log', generateLog)

const server = fastify()

server.get('/ping', async (request, reply) => {
    return 'pong\n'
})

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})