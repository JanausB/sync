          
var socket = io();

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {                                            //Dummy player here both to establish the template and generate an initial value for the player var
    player = new YT.Player('player', {                                          //Deletion of this segment will lead to erroring out when the 
      height: '390',
      width: '640',
      videoId: '2K4bGTtamJ4',
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    socket.emit('player-change', {
                change: 2,
                time: player.getCurrentTime()
            });
}


// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
    // if (event.data == YT.PlayerState.PLAYING && !done) {
    //   setTimeout(stopVideo, 6000);
    //   done = true;
    // } else{
        var switcher = player.getPlayerState();
        switch(switcher) {
        case 0:                                                                 //Video has finished, request the id of the next queued video
            socket.emit('player-change', {
                change: 0,
                cur: player.j.videoData.video_id
            });
            break;
        case 1:                                                                 //Client has started playing, send play command to all nonplaying clients
            socket.emit('player-change', {
                change: 1,
                time: player.getCurrentTime()
            });
            break;
        case 2:                                                                 //Client has paused video, send pause command to all playing clients
            socket.emit('player-change', {
                change: 2,
                time: player.getCurrentTime()
            });
            break;
        case 3:                                                                 //Client is playing video for the first time, causing odd feedback issues
            socket.emit('player-change', {                                      //This was initially treated like play from 0 to adjust for embed unloading
                change: 3,
                time: player.getCurrentTime()
            });
            break;
        case 5:
            socket.emit('player-change', {
                change:5
            });
            break;
        default:
        
        //  }
    }
}

function stopVideo() {
    player.stopVideo();
}

function pauseVideo(){
    player.pauseVideo();
    socket.emit('pause');
}
       
function change(videoId){
    // alert("test")
    if(player)
        player.destroy();
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: videoId,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
    
};
          
function addQueue(url){
    var start = url.indexOf('=')+1 ;
    var end = url.indexOf('&');
    if(end == -1)
        end = url.length;
    var id = url.slice(start, end);
    console.log(id);
    socket.emit('addQueue', id);
}

$('#test').on('click', function(){
   addQueue($('#next').val()); 
   $('#next').val('')
});

socket.on('connect', function(){
    console.log("Connected to server");
    var params= jQuery.deparam(window.location.search);
    
    socket.emit('connection', params, function(err){
        if(err){
           alert(err);
           window.location.href='/';
       }else{
           console.log("Connection to server established");
           
       }
    });
});

socket.on('update_userlist', function (list) {
    var params= jQuery.deparam(window.location.search);
    var active = '';
    if(params)
        active = params.name;
    var html = '<div class="list-group">';
    if(!list)                                                                   //list is empty
        html = '<li class="list-group-item active">No users...somehow. You should let jay know this is broken!</li>';
    else{
        for(var i = 0; i< list.length; i++){
            if(list[i] == active)
                html +=`<li class="list-group-item active"><h3 class="content-font">${list[i]}</h3></li>`
            else
                html +=`<li class="list-group-item"><h3 class="content-font">${list[i]}</h3></li>`
        }
        html += "</div>";
    }
    // console.log("updating user list", html);
    $("#user_list").html(html);
})

socket.on('current', function(id) {
    if(id)
        change(id);
});

socket.on('pause', function(time) {
    if(player.getPlayerState != undefined){
        if(player.getPlayerState() != 2){
            player.pauseVideo();
            player.seekTo(time, true);
        }
    }
})

socket.on('play', function(time) {
    if(player.getPlayerState != undefined){
        if(player.getPlayerState() != 1 || (Math.abs(player.getCurrentTime()-time) >3)){
            player.pauseVideo();
            player.seekTo(time, true);
            player.playVideo();
        }
    }
})

socket.on('next', function(videoId){
    if(videoId && videoId != player.j.videoData.video_id)
        change(videoId);
});

socket.on('update_list', function(list) {
    var html = '<div class="list-group">';
    if(!list[0])                                                                   //list is empty
        html += '<li class="list-group-item active">No videos in the queue, try submitting one!</li>';
    else{
        for(var i = 0; i< list.length; i++){
            if(i == 0)
                html +=`
                <li class="list-group-item active">
                    <h6 class="subtitle-font">Currently watching:</h6>
                    <hr>
                    <div class="row">
                        <div class="col-lg-3 queue-item-col">
                            <img src="${list[i].img}" class="img-responsive img-rounded" alt="Cinque Terre">
                        </div>
                        <div class="col-lg-9 queue-item-col">
                            <h3 class="content-font" >${list[i].title}</h3>
                        </div>
                    </div>
                </li>`
            else if(i == 1)
                html +=`<li class="list-group-item"><h6 class="subtitle-font">Up Next:</h6><hr class="up-next-hr"><div class="row"><div class="col-lg-3 queue-item-col"><img src="${list[i].img}" class="img-responsive img-rounded" alt="Cinque Terre"></div><div class="col-lg-9 queue-item-col"><h3 class="content-font">${list[i].title}</h3></div></div></li>`
            else
                html +=`<li class="list-group-item"><div class="row"><div class="col-lg-3 queue-item-col"><img src="${list[i].img}" class="img-responsive img-rounded" alt="Cinque Terre"></div><div class="col-lg-9 queue-item-col"><h3 class="content-font">${list[i].title}</h3></div></div></li>`
        }
    }
    html += "</div>";
    console.log(html);
    $("#queue_list").html(html);
});


socket.on('disconnect', function(){
   console.log("Disconnected from server"); 
});