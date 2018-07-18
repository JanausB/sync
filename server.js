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
 queue.add("ndJv_VZpzP8");
 queue.add("MOZ_4ytjMSw");

app.use(express.static(path.join(__dirname, 'public')));


// app.get("/*", function(req, res){
//     console.log("hi");
//     res.render('index.html'); 
    
// });


io.on('connect', function(socket){
    console.log("New user connected");
    
    socket.on('connection', function(params, callback){
        
        if(queue.front()){
            console.log("sending front list video to new user")
            socket.emit('current', queue.front().id);
            console.log("sending video list to new user")
            socket.emit('update_list', queue.list());
            socket.broadcast.emit('pause', 0);
        }
        else
            console.log("No video in queue, idling...")
    });
    
    socket.on('player-change', function(status) {
        console.log(socket.id);
        console.log(status);
        if(status.change == 2 || status.change == 5){                                                 //Someone paused or video unloaded, tell all other clients to pause and seek to the paused time
            if(status.change == 2)
                socket.broadcast.emit('pause', status.time);
            else
                socket.broadcast.emit('pause', 0);
        }else if(status.change == 1 || status.change == 3){                                           //Someone is playing from pause
            socket.broadcast.emit('play', status.time + .5);
        }else if(status.change == 0){
            console.log(status.cur + "has finished playing for client " + socket.id);
            // console.log("front video is " + queue.front().id);
            if(queue.front()){
                console.log("front video is " + queue.front().id);
                if(status.cur == queue.front().id){
                    console.log("A client has finished the current video")
                    queue.next();
                }
            }else
                console.log("queue is empty")
            setTimeout(function(){
                if(queue.front())
                    socket.emit('next', queue.front().id);
                io.emit('update_list', queue.list());
            }, 5000);
        }
    });
    
    socket.on('addQueue', function(id) {
        var emptyflag = (queue.front() === undefined);
        // console.log("add video request in:", id)
        queue.add(id);
        
        if(emptyflag)
            setTimeout(function(){
                io.emit('next', queue.front().id);
            }, 5000);
        
        setTimeout(function(){
                // console.log("updating list for all users");
                io.emit('update_list', queue.list());
                // console.log(queue.list());
            }, 1500);
        
        
    });
    
    socket.on('disconnect', function(){
        console.log("Client disconnected");
    });
});



server.listen(process.env.PORT, process.env.IP, function(){
    console.log("sync listner Service spinning, up. We're in the pipe, 5 by 5!");
});