import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const server = createServer (app)
const io = new Server(server)

app.get('/', (req, res) => {
    res.send('Server')
})

io.on('connection', (socket) => {
    console.log(socket.id)
})

app.listen(9000, () => {
    console.log('*** Server Listening on port 9000 ***')
})