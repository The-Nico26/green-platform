var config = require('../config'),
    git = require('simple-git/promise')(__dirname),
    net = require('net'),
    JsonSocket = require('json-socket');

const dns = require('dns')
const { spawn } = require('child_process');

var fn_lookup = (hostname) => dns.lookup(hostname, (err, result) => {return result})

var socket = new JsonSocket(new net.Socket());
socket.connect(config.port_webhook, fn_lookup(config.server_webhook));

git.checkIsRepo()
   .then(() => git.checkout(config.branch))
   .then(() => git.fetch())
   .then(() => spwan('nodemon', [config.branch+"/"+config.branch]));


socket.on('connect', ()=>{
    socket.sendMessage({'secret':config.secret});
    socket.on('message', (html)=>{
        git.checkout(config.branch).then(() => git.pull('origin', 'master', {'--rebase' : 'true'}))
    })
    socket.on('close', (message)=>{
        console.log(message);
        process.exit(0);
    })
})

