const socket = io()

//elements
const $messageForm = document.querySelector('#input-form')
const $messageInput = document.querySelector('#message-input')
const $sendLocationButton = document.querySelector('#send-location')
const $messageButton = document.querySelector('#message-button')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    //nova mensagem
    const $newMessage = $messages.lastElementChild

    //altura da nova mensagem 
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //altura visivel
    const visibleHeight = $messages.offsetHeight

    //altura da caixa de mensagens
    const containerHeight = $messages.scrollHeight

    //quando longe eu scrollei
    const scrollOffSet = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffSet) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm:ss')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.text,
        createdAt: moment(location.createdAt).format('H:mm:ss')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomUsers', ({ room, users }) => {    
    

    const html = Mustache.render(sidebarTemplate, {
       room,
       users 
    })

    document.querySelector('#chat-sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    $messageButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value


    socket.emit('sendMessage', message, () => {
        $messageButton.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()
    })    
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Atualize para um navegador mais novo')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords

        socket.emit('sendLocation', {
            latitude,
            longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})