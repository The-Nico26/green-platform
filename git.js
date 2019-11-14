var config = require('./config'),
    git = require('simple-git')(__dirname),
    net = require('net'),
    JsonSocket = require('json-socket');

var socket = new JsonSocket(new net.Socket());
socket.connect(config.port_webhook, config.server_webhook);

git.checkout(config.branch);

socket.on('connect', ()=>{
    socket.sendMessage({'secret':config.secret, 'type':'init', 'git':config.git});
    socket.on('message', (html)=>{
        console.log(html);
        git.pull().tags((err, tags) => console.log("Latest available tag: %s", tags.latest));
    })
    socket.on('close', (message)=>{
        console.log(message);
        process.exit(0)
    })
})