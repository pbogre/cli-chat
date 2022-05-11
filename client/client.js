const io = require('socket.io-client')
const readline = require('readline')
var notifier = undefined
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const settings = require('./config.js')
if(settings.notifications) notifier = require('node-notifier')


var socket = io('http://'+settings.host+':'+settings.port, {
    timeout: 5000
})



//////////////////////////// Connection Handling

console.clear()
console.log('CONNECTING TO '+settings.host+':'+settings.port)
socket.on('connect', () => {
    rl.prompt(true)
    if(!settings.anonymous) socket.emit('user_joined', {username: settings.username}) 
})

socket.on('welcome', (data) => {
    console.clear()
    output('Welcome to CLI-chat | Version '+data.version, "green")
    output('Username: \x1b[0m'+data.username, "blue")
    output('ID: \x1b[0m'+data.uid, "blue")
    output('Host: \x1b[0mhttp://'+settings.host+':'+settings.port, "blue")
})

socket.on('disconnect', () => {
    output('CONNECTION LOST!', "red")
    process.exit()
})

socket.on('connect_error', (err) => {
    output('CONNECTION ERROR!', "red")
    process.exit()
})

socket.on('connect_timeout', (err) => {
    output('CONNECTION TIMED OUT!', "red")
    process.exit()
})





//////////////////////////// Event handling

socket.on('system', (data) => {
    switch(data.type){
        case "cmd":
            output('(*) '+data.content, "dim")
            break
        
        case "usr":
            output('(!) '+data.content, "yellow")
            break

        default:
            output('(?) '+data.content, "dim")
    }
})

socket.on('message', (data) => {
    const author = data.author
    const content = data.content
    output('<'+author+'> '+content, '', {title: author, message: content})
})

socket.on('pm_in', (data) => {
    const author = data.author
    const content = data.content
    const aid = data.aid
    output('FROM '+author+' ('+aid+'): '+content, "purple", {title: author, message: content})
})

socket.on('pm_out', (data) => {
    const author = data.author
    const content = data.content
    const aid = data.aid
    output('TO '+author+' ('+aid+'): '+content, "purple")
})





//////////////////////////// Output System

function output(content, style, data){
    process.stdout.clearLine()
    switch(style){
        case "yellow":
            console.log('\r\x1b[33m'+content+'\x1b[0m')
            break
        
        case "green":
            console.log('\r\x1b[32m'+content+'\x1b[0m')
            break

        case "blue":
            console.log('\r\x1b[34m'+content+'\x1b[0m')
            break
        
        case "red":
            console.log('\r\x1b[31m'+content+'\x1b[0m')
            break

        case "purple":
            console.log('\r\x1b[35m'+content+'\x1b[0m')
            break
        
        case "dim":
            console.log('\r\x1b[2m'+content+'\x1b[0m')
            break

        default:
            console.log('\r'+content)
    }

    if(settings.notifications && data != undefined){
        notifier.notify({
            title: data.title,
            message: data.message,
        })
    }

    rl.prompt(true)
}





//////////////////////////// Console and Commands

rl.on('line', (input) => {
    if(input.startsWith(',')){
        const args = input.slice(1).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        switch(command){
            case "pm":
                var target = args[0]; args.shift() 
                var content = args.join(' ')
                socket.emit('private_message', {target, content})

                break

            case "id":
                var target = args.join(' ')
                socket.emit('user_id_request', target)

                break

            case "ls":
                socket.emit('users_request')

                break

            case "help":
                socket.emit('help')

                break

            case "q":
                process.exit()

            case "quit":
                process.exit()

            default:
                socket.emit('unknown_command')

        }
    }
    else{
        input = input.trim()
        if(input != '') socket.send({input})
    }
    rl.prompt(true)
})
