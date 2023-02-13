const users=[]

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username||!room) {
        return {
            error:'Username and room are required'
        }
    }

    //check for existing user
    const exsitingUser = users.find((user) => {
        return user.room === room && user.username === username
    })



    if(exsitingUser) {
        return {
            error: 'Username is in use'
        }
    }

    //store user
    const user = {id,username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id
    })
    return user
}

const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => {
        room = room.trim().toLowerCase()
        return user.room === room
    })
    return usersInRoom
}


// const addUser1 = addUser({
//     id:22,
//     username:'Tina',
//     room: 'Reply'
// })

// addUser1;


// const addUser2 = addUser({
//     id:22,
//     username:'Tina',
//     room: 'Reply'
// })

// console.log(addUser2)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}


