const path                  = require("path");                                          
const publicPath            = path.join(__dirname, "/public");
const express               = require("express");
const port                  = process.env.PORT;
const socketIO              = require("socket.io");
const http                  = require("http");
const {Users}               = require("./server/utils/users");
const {Queue}               = require("./server/utils/queue");

var app                     = express();
var server                  = http.createServer(app);
var io                      = socketIO(server);
var queue                   = new Queue();

app.use(express.static(path.join(__dirname, 'public')));


// app.get("/*", function(req, res){
//     console.log("hi");
//     res.render('index.html'); 
    
// });


io.on('connect', function(socket){
    console.log("New user connected");
    
    socket.on('connection', function(params, callback){
        console.log("1");
    });
    
    socket.on('player-change', function(status) {
        console.log(socket.id);
        console.log(status);
        if(status.change == 2 || status.change == 5){                                                 //Someone paused, tell all other clients to pause and seek to the paused time
            socket.broadcast.emit('pause', status.time);
        }else if(status.change == 1){                                           //Someone is playing from pause
            socket.broadcast.emit('play', status.time);
        }else if(status.change == 0){
            console.log(status.cur);
            if(status.cur == queue.front())
                queue.next();
            setTimeout(function(){
                socket.emit('next', queue.front());
            }, 5000);
        }
    });
    
    socket.on('addQueue', function(id) {
        var emptyflag = (queue.front() === undefined);
        queue.add(id);
        console.log(queue.list());
        if(emptyflag)
            setTimeout(function(){
                io.emit('next', queue.front());
            }, 5000);
        
    });
    
    socket.on('disconnect', function(){
        console.log("Client disconnected");
    });
});



server.listen(process.env.PORT, process.env.IP, function(){
    console.log("sync listner Service spinning, up. We're in the pipe, 5 by 5!");
});