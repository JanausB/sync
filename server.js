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

    
    socket.on('connection', function(params, callback){                         //Runs on client page load for watch.html
        if(queue.front()){
            console.log("sending front list video to new user")
            socket.emit('current', queue.front().id);
            console.log("sending video list to new user")
            socket.emit('update_list', queue.list());
            //Importantly gives users options: If the users want to start over, new client starts video. If the new client wants to catch up, other client starts video
            socket.broadcast.emit('pause', 0);                                  //New user has joined, pause all clients
        }
        else
            console.log("No video in queue, idling...")
    });
    
    socket.on('player-change', function(status) {
        console.log(socket.id);
        console.log(status);
        if(status.change == 2 || status.change == 5){                           //Someone paused or video unloaded, tell all other clients to pause and seek to the paused time
            if(status.change == 2)
                socket.broadcast.emit('pause', status.time);                    //Send pause command to all clients
            else
                socket.broadcast.emit('pause', 0);
        }else if(status.change == 1 || status.change == 3){                     //Someone is playing from pause
            socket.broadcast.emit('play', status.time + .5);
        }else if(status.change == 0){                                           //Someone has finished the video
            console.log(status.cur + "has finished playing for client " + socket.id);
            if(queue.front()){                                                  //Is there another video in the queue?
                console.log("front video is " + queue.front().id);
                if(status.cur == queue.front().id){                             //Is the video this client the same as what was supposed to be currently playing?
                    console.log("A client has finished the current video");     
                    queue.next();                                               //Shift the current video from the front of the queue
                }
            }else
                console.log("queue is empty");
            setTimeout(function(){
                if(queue.front())
                    socket.emit('next', queue.front().id);                      //Update playing video if another is ready
                io.emit('update_list', queue.list());                           //List update happens after a delay
            }, 5000);
        }
    });
    
    socket.on('addQueue', function(id) {                                        //Client has sent a video id to the server
        var emptyflag = (queue.front() === undefined);                          //This is now at the front of the queue and thus a change emit will be sent after the add operation
        // console.log("add video request in:", id)
        queue.add(id);                                                          //Add to queue object
        
        if(emptyflag)
            setTimeout(function(){
                io.emit('next', queue.front().id);                              //Send change command to clients after delay
            }, 5000);
        
        setTimeout(function(){
                // console.log("updating list for all users");
                io.emit('update_list', queue.list());                           //Update queue list with new addition after delay
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