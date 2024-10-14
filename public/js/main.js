const createUserBtn = document.getElementById('create-user')
const userNameBtn = document.getElementById('username')
const allUsersHtml = document.getElementById('all-users')
const userVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')
const endCallBtn = document.getElementById("end-call-btn");
const socket = io()
let localStream;

const PeerConnection = (function() {
    let peerConnection;
    const createPeerConnection = () => {
        const config = {
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                }
            ]
        }
        peerConnection = new RTCPeerConnection(config)

        // add local stream to peer connection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream)
        })

        //listen to remote streams and add to peer connection
        peerConnection.ontrack = function(event) {
            remoteVideo.srcObject = event.streams[0]
        }

        PeerConnection.onicecandidate = function(event) {
            if(event.candidate) {
                socket.emit('icecandidate', event.candidate)
            }
        }

        return peerConnection
    }

    return {
        getInstance: () => {
            if(!peerConnection) {
                peerConnection = createPeerConnection()
            }
            return peerConnection 
        }
    }
})()

createUserBtn.addEventListener('click', (event) => {
    if(userNameBtn.value != '') {
        const usernameInput = document.querySelector('.username-input')
        socket.emit('join-user', username.value)
        usernameInput.style.display = 'none'
    }
})

socket.on('joined', (users) => {
    console.log({users})    

    const createHtmlUsers = () => {
        for(let user in users) {
            console.log(user)
            const li = document.createElement('li')
            li.textContent = `${user} ${user === username.value ? '(You)': ''}`

            if(user !== username.value) {
                const button = document.createElement('button')
                button.classList.add('call-btn')
                button.addEventListener('click', (event) => {
                    startCall(users[user])
                })
                const image = document.createElement('img')
                image.setAttribute('src', '/images/phone.png')
                image.setAttribute('width', 20)

                button.appendChild(image)

                li.appendChild(button)
            }

            allUsersHtml.appendChild(li)
        }
    }

    createHtmlUsers()
})  

socket.on('offer', async ({ from, to, offer }) => {
    try {
        console.log(offer)
        const pc = PeerConnection.getInstance();
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { from, to, answer: pc.localDescription });
    } catch (error) {
        console.error('Failed to handle the offer:', error);
    }
})

socket.on('answer', async ({
    from,
    to,
    answer
}) => {
    try {
        const pc = PeerConnection.getInstance()
        const desc = new RTCSessionDescription(answer)
        await pc.setLocalDescription(desc)
        socket.emit("end-call", {from, to});
    } catch (error) {
        console.error('Failed to set local description:', error)
    }
})

socket.on("icecandidate", async candidate => {
    console.log({ candidate });
    const pc = PeerConnection.getInstance();
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
});
socket.on("end-call", ({from, to}) => {
    endCallBtn.style.display = "block";
});
socket.on("call-ended", (caller) => {
    endCall();
})

const startCall = async (user) => {
    console.log(user)
    const pc = PeerConnection.getInstance()
    const offer = await pc.createOffer()

    await pc.setLocalDescription(offer)
    socket.emit('offer', {
        from: username.value,
        to: user,
        offer: pc.localDescription
    })
}

const endCall = () => {
    const pc = PeerConnection.getInstance();
    if(pc) {
        pc.close();
        endCallBtn.style.display = 'none';
    }
}

const startUserVideo = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        localStream = stream

        userVideo.srcObject = stream
    } catch (error) {
        console.log(error)
    }
}

startUserVideo()