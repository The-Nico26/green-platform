const config = require('./config');
var ipc = require('node-ipc');
var nunjucks = require('nunjucks');
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
            func: '',
            html: nunjucks.render('index.html', {name: 'Nicolas'})
        }
    })
})