var settings = {}

// start a private server using nginx
// proxy to http://localhost:5001 (or whatever port server.js is listening on)

settings.host = '127.0.0.1'
settings.port = '5000'

settings.username = 'User'
settings.anonymous = false
settings.notifications = true

module.exports = settings
