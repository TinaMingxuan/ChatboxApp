const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("#send-location");
const $messageFormButton = document.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
    //
    const $newMessage = $messages.lastElementChild
    //height of message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    console.log(newMessageHeight)

    //visile height
    const visibleHeight = $messages.offsetHeight

    //Height of message containers
    const containerheight = $messages.scrollHeight

    // how far I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerheight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }




}

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username:message.username,
    message: message.text,
    createAt: moment(message.createAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on("locationMessage", (url) => {
  const html = Mustache.render(locationTemplate, {
    username:url.username,
    url: url.text,
    createAt: moment(url.createAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
      });

    document.querySelector('#sidebar').innerHTML = html
    
})

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  //disable the button before the last message send
  const message = e.target.elements.message.value;
  // const message = document.querySelector('#messageInput').value
  socket.emit("sendMessage", message, (error) => {
    //enable the button again
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log("Message delivered");
  });
});

$locationButton.addEventListener("click", () => {
  $locationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your brower");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const geoData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    socket.emit("geoData", geoData, (message) => {
      $locationButton.removeAttribute("disabled", "disabled");
      console.log(message);
    });
  });
});
// document.querySelector('#increment').addEventListener('click',() => {
//     console.log('Clicked')
//     socket.emit('increment')
// })
socket.emit("join", { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
});

