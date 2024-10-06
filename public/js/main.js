const createUserBtn = document.getElementById('create-user')
const userNameBtn = document.getElementById('username')
const socket = io()


createUserBtn.addEventListener('click', (event) => {
    if(userNameBtn.value != '') {
        socket.emit('join-user', username.value)
    }
})