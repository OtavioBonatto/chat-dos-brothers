const users = []

const addUser = ({ id, username, room }) => {

    //formata os dados
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //verifica se os dados são validos
    if(!username || !room) {
        return {
            error: 'Nome de usuário e sala são necessários'
        }
    }

    //verifica se usuario já existe
    const existingUser = users.find((user) => user.room === room && user.username === username)

    //verifica o nome do usuario
    if(existingUser) {
        return {
            error: 'Nome de usuário em uso'
        }
    }

    const user = {
        id,
        username,
        room
    }

    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user)=> user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

console.log(users)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}