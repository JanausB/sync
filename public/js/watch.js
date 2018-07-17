          
var socket = io();

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
// function onYouTubeIframeAPIReady() {
// player = new YT.Player('player', {
//   height: '390',
//   width: '640',
//   videoId: '2K4bGTtamJ4',
//   events: {
//     'onReady': onPlayerReady,
//     'onStateChange': onPlayerStateChange
//   }
// });
// }

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
    if (event.data == YT.PlayerState.PLAYING && !done) {
      setTimeout(stopVideo, 6000);
      done = true;
    } else{
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
        case 3:                                                                 //Client is playing video for the first time, treated like play from 0 to adjust for embed unloading
            socket.emit('player-change', {
                change: 1,
                time: player.getCurrentTime()
            });
            break;
        case 5:
            socket.emit('player-change', {
                change:5
            });
            break;
        default:
        
         }
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
        end = url.length - 1;
    var id = url.slice(start, end);
    console.log(id);
    socket.emit('addQueue', id);
}

$('#test').on('click', function(){
   addQueue($('#next').val()); 
   $('#next').val('')
});



socket.on('connect', function(){
   console.log("connected to server"); 
});

socket.on('pause', function(time) {
    if(player.getPlayerState() != 2){
        player.pauseVideo();
        player.seekTo(time, true);
    }
})

socket.on('play', function(time) {
    if(player.getPlayerState() != 1 || (Math.abs(player.getCurrentTime()-time) >5)){
        player.pauseVideo();
        player.seekTo(time, true);
        player.playVideo();
    }
})

socket.on('next', function(videoId){
    if(videoId)
        change(videoId);
});


socket.on('disconnect', function(){
   console.log("Disconnected from server"); 
});