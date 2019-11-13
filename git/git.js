var config = require('../config'),
    git = require('simple-git/promise')(__dirname),
    net = require('net'),
    JsonSocket = require('json-socket');

const dns = require('dns')
const { spawn } = require('child_process');


var socket = new JsonSocket(new net.Socket());
socket.connect(config.port_webhook, config.server_webhook);

git.fetch();

socket.on('connect', ()=>{
    socket.sendMessage({'secret':config.secret, 'type':'init', 'git':config.git});
    socket.on('message', (html)=>{
        console.log("git checkout");
        git.checkout(config.branch).then(() => git.pull('origin', 'master', {'--rebase' : 'true'}))
    })
    socket.on('close', (message)=>{
        console.log(message);
        process.exit(0);
    })
})