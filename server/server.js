const version = '0.1.6'

const http = require('http').createServer((req, res) => {
	res.end('CLI-chat | Version '+version)
});
const io = require('socket.io')(http);
const port = 5001
const host = 'localhost'


var users = []
var h_uid = 0

io.on('connection', (socket) => {

    console.log("new connection")

    const uid = h_uid; h_uid++
    var _username = "Anonymous User"
    const sid = socket.id
    users.push({uid, sid, username: _username})

    socket.broadcast.emit('system', { content: 'New connection...', type: 'usr'})
    socket.emit('welcome', {username: _username, version, uid})

    socket.on('user_joined', (data) => {
        if(data.username != undefined) {
            _username = data.username
            getUser({sid: sid}).username = data.username
        }

        console.log(_username + ' joined')

        socket.broadcast.emit('system', { content: '"'+_username+'" joined', type: 'usr'})
        socket.emit('welcome', {username: _username, version, uid})
    })

    socket.on('message', (data) => {
        console.log(data)

        if( data.input != "" ) socket.broadcast.emit('message', {author: _username, content: data.input})
    })

    socket.on('disconnect', () => {
        var _username = 'Anonymous User'
        var _user = users.filter(user => user.sid == socket.id)[0]
        if(_user != undefined) _username = _user.username

        socket.broadcast.emit('system', { content: '"'+_username+'" left', type: 'usr'})

        users = users.filter(user => user.uid != uid)

        console.log(_username + ' left')
    })

    socket.on('private_message', (data) => {
        console.log(data)

        if(data.content == undefined || data.content == '') {
            socket.emit('system', {content: 'Invalid message', type: 'cmd'})
            return
        }

        const user = getUser({uid: data.target})
        if(!user){
            socket.emit('system', { content: 'User not found', type: 'cmd'})
        }
        else{
            socket.emit('pm_out', {author: user.username, aid: user.uid, content: data.content})
            io.to(user.sid).emit('pm_in', {author: _username, aid: uid, content: data.content})
        }
    })

    socket.on('user_id_request', (target) => {
        if(target != ''){
            var results = getUser({username: target})

            var output = "Matches for '"+target+"':"
            if(!results) output = 'No results for: '+target
            else {
                for(let i = 0; i < results.length; i++) output += "\n - "+results[i].uid
            }

            socket.emit('system', { content: output, type: 'cmd'})
        }
        else{
            socket.emit('system', { content: "Your id: "+uid, type: 'cmd'})
        }
    })

    socket.on('users_request', () => {
        var output = "Online Users:"
        for(let i = 0; i < users.length; i++){
            output += '\n - <'+users[i].username+'> ('+users[i].uid+')'
        }
        socket.emit('system', { content: output, type: 'cmd'})
    })

    socket.on('unknown_command', () => {
        socket.emit('system', { content: 'Unknown command\nUse `,help` for a list of commands', type: 'cmd'})
    })

    socket.on('help', () => {
        var output = "List of commands:\n"+
                        " - `pm` [id] [content] | send a private message to someone\n"+
                        " - `id` (username) | get own or someone's id\n"+
                        " - `ls` | get list of online users\n"+
                        " - `q` / `quit` | leave the session"

        socket.emit('system', { content: output, type: 'cmd'})
    })
})






http.listen(port, host, (err) => {
    if(err) console.log(err)
    console.log(`server listening on: http://${host}:${port}`)
})


function getUser({sid, uid, username}){

    if(sid != undefined){
        for(let i = 0; i < users.length; i++){
            if(users[i].sid == sid){
                return users[i]
            }
        }
    }
    else if (uid != undefined){
        for(let i = 0; i < users.length; i++){
            if(users[i].uid == uid){
                return users[i]
            }
        }
    }
    else if(username != undefined){
        var result = []
        for(let i = 0; i < users.length; i++){
            if(users[i].username == username){
                result.push(users[i])
            }
        }
        return result
    }

    return false
}
