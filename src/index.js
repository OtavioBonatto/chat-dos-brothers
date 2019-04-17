const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { generateMessage, generateLocation } = require('./utils/message');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    
    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room })

        if(error) {
            return callback(error)
        }

        socket.join(room)

        socket.emit('message', generateMessage(`Bem vindo ${username}`))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} juntou-se a sala`))
        io.to(user.room).emit('roomUsers', {
            room,
            users: getUsersInRoom(room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username ,message))
        callback()
    })

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} desconectou-se da sala`))
        }        
    })

});    

server.listen(port, () => console.log('servidor rodando'))