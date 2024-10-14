import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const app = express()
const server = createServer (app)
const io = new Server(server)

const users = {}

const __dirname = dirname(fileURLToPath(import.meta.url))
const appPath = __dirname + '/app/index.html'

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(join(appPath))
})

io.on('connection', (socket) => {
    socket.on('join-user', (username) => {
        users[username] = { username, id: socket.id}
        io.emit('joined', users)
    })

    socket.on('offer', ({
        from,
        to,
        offer
    }) => {
        console.log(offer)
        io.to(to.id).emit('offer', { from, to, offer })
    })

    socket.on('answer', ({
        from,
        to,
        answer
    }) => {
        io.to(users[from].id).emit('answer', { from, to, answer })
    })

    socket.on("end-call", ({from, to}) => {
        io.to(users[to].id).emit("end-call", {from, to});
    });

    socket.on("call-ended", caller => {
        const [from, to] = caller;
        io.to(users[from].id).emit("call-ended", caller);
        io.to(users[to].id).emit("call-ended", caller);
    })

    socket.on("icecandidate", candidate => {
        console.log({ candidate });
        //broadcast to other peers
        socket.broadcast.emit("icecandidate", candidate);
    }); 
})

server.listen(9000, () => {
    console.log('*** Server Listening on port 9000 ***')
})