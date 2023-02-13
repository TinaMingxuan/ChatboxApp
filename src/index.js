const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const { generateMessage, generateURL } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// let count = 0;
// //server(emit) -> client(receive)- counterUpdated
// //client(emit) -> server(receive) - increment
// io.on("connection", (socket) => {
//   console.log("New WebSocket connection");
//   socket.emit('countUpdated', count)
//   socket.on('increment', ()=> {
//     count++
//     //socket.emit('countUpdated', count)
//     io.emit('countUpdated',count)

//     })
// });

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      callback(error);
    }

    if (user) {
        socket.join(user.room);
    //io.to.emit, socket.boardcast.to.emit
        socket.emit("message", generateMessage('Admin',"Welcome"));
        socket.broadcast
        .to(user.room)
        .emit("message", generateMessage('Admin',`${user.username} has joined!`));

        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback();
    }
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id)
    const filer = new Filter();
    if (filer.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });


  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage('Admin', `${user.username} has left!`)
      );
      
      io.to(user.room).emit('roomData', {
        room:user.room,
        users:getUsersInRoom(user.room)
    })
    }
  });

  socket.on("geoData", (geoData, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit(
      "locationMessage",
      generateURL(user.username,
        `https://google.com/maps?q=${geoData.latitude},${geoData.longitude}`
      )
    );
    callback("Location send");
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
