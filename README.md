# cli-chat
NodeJS based CLI messaging system using sockets that connects users through a specified IP and port

![Preview](https://i.imgur.com/EzNM1gO.png)

# Requirements
### Server
- Node (`brew install node`)
- Socket.io (`npm install socket.io`)
### Client
- Node (`brew install node`)
- Socket.io-client (`npm install socket.io-client`)
- [OPTIONAL] Node-notifier (`npm install node-notifier`)


# Instructions
## Running a server
These are the instructions for running a server in MacOS, if you are on Windows or Linux the directories i mention may differ.
- `brew install nginx`
- travel to `usr/local/etc/nginx`
- create new file under `nginx/servers` with the name that you wish
- paste the following inside the file:
```nginx
server {
    listen 5000;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
(for more information about nginx, visit https://www.nginx.com/)
- Make sure nginx server proxies to port that `server.js` is listening
- run the server using `node server.js`
- to test that everything is working, run `curl http://127.0.0.1:5000` from the machine that is running the server
- if you get a response it means that it is working as intended
Now users under your same Wi-Fi will be able to connect to CLI-Chat using your local ip (usually looks something like 192.168.1.X)

If you wish for users to connect from outside your Wi-Fi, you need to to port-forward the port that the nginx server is listening to (5000 by default) and make you IPv4 static. 

Users from anywhere in the world will be able to connect using your IPv4

## Connecting to the server
- open `config.js`
- set `settings.host` to whatever IP the server is running on
- set `settings.port` to whatever PORT the nginx server is listening to
- run `node client.js` and you should be able to connect

# Information
## Client Configuration
- `settings.host` (string): IPv4 or Domain to connect to
- `settings.port` (string): The port that will be used to connect
- `settings.username` (string): The username that others will see you as
- `settings.anonymous`(bool): Anonymous mode makes your username "Anonymous User" and does not alert others when you join
- `settings.notifications` (bool): Whether or not to see notifications when messages are recieved
## Commands
- `,help`: Shows all commands and descriptions
- `,ls`: Shows all active users and their IDs
- `,id` (username): Shows ID of specified username or of sender if username isn't provided
- `,pm` [ID] [MESSAGE]: Sends private message to specified ID
- `,q` / `,quit`: Leaves chat

# Extra
If you have any questions or find any bugs feel free to open a pull request or message me privately.
