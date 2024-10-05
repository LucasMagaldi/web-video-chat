import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const app = express()
const server = createServer (app)
const io = new Server(server)

const __dirname = dirname(fileURLToPath(import.meta.url))
const appPath = __dirname + '/app/index.html'

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(join(appPath))
})

io.on('connection', (socket) => {
    console.log(socket.id)
})

app.listen(9000, () => {
    console.log('*** Server Listening on port 9000 ***')
})