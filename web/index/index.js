const config = require('../config').modules.index;
var ipc = require('node-ipc');
var nunjucks = require('nunjucks');
const fs = require('fs');

nunjucks.configure({
    autoescape: true
})
ipc.config.id = 'index';
ipc.config.retry = 1500;
ipc.config.silent = true;

ipc.connectTo(
    'platform',
    ()=>{
        ipc.of.platform.on(
            'connect', ()=>{
                ipc.of.platform.emit('init', {
                    name : config.name
                })
            });
        ipc.of.platform.on(
            'disconnect',
            ()=>{
                ipc.log('Disconnected from plateform'.notice);
                process.exit(0);
            }
        )
    }
)

ipc.of.platform.on('url./', (packet, socket)=>{
    ipc.of.platform.emit('returnHTML', {
        id: packet.id,
        data:{
            tag: '#body',
            html: nunjucks.render(__dirname+'/src/index.html', {name: 'Nicolas'}),
            javascript: fs.readFileSync(__dirname+'/src/index.js', 'utf8')
        }
    })
})