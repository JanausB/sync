const path                  = require("path");                                          
const publicPath            = path.join(__dirname, "../public");
const express               = require("express");
const port                  = process.env.PORT;
const socketIO              = require("socket.io");
const http                  = require("http");

var app                     = express();
var server                  = http.createServer(app);
var io                      = socketIO(server);

app.use(express.static(publicPath));
app.get("/*", function(req, res){
    res.render('index'); 
});


io.on('connection', function(socket){
    console.log("New user connected");
    
    
    
});


server.listen(process.env.PORT, process.env.IP, function(){
    console.log("node-chat-app listner Service spinning, up. We're in the pipe, 5 by 5!");
});