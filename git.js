var config = require('./config').git,
    git = require('simple-git')(__dirname),
    net = require('net'),
    JsonSocket = require('json-socket');

var socket = new JsonSocket(new net.Socket());
socket.connect(config.port_webhook, config.server_webhook);

git.checkout(config.branch);
git.pull().tags((err, tags) => console.log("Tags "+tags.latest));

socket.on('connect', ()=>{
    console.log("GIT connected server");
    socket.sendMessage({'secret':config.secret, 'type':'init', 'git':config.git});
    socket.on('message', (html)=>{
        git.pull()
    })
    socket.on('close', (message)=>{
        console.log(message);
        process.exit(0)
    })
})