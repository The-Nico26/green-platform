var events = require('events');
var event = new events.EventEmitter();

event.on('test', (data)=>{
    return data;
})

console.log(event.emit('test', function(){return 'rest';}));