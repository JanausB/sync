var rp = require('request-promise');

const key = 'AIzaSyBSO90QPdh1QjRBqglysHn0ZCNpW_0gvsg';

class Queue{
    constructor(){
        this.queue=[]
    }
    
    
    add(id){
        console.log("adding video to queue:", id);
        //this.queue.push(id);
        var url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id='+ id + '&key=' + key;
        addHelper(url).then(ret => {
            // use the count result in here
            // console.log(`Got ret = ${ret.id}`);
            // console.log(id);
            this.queue.push({
                id:ret.id,
                title: ret.title,
                img: ret.img
            })
        }).catch(err => {
            console.log('URL incorrect, no videos found ', err);
        });
        
        // return this.queue[this.queue.length-1];
    }
    
    next(){
        return this.queue.shift();
    }
    
    list(){
        return this.queue;
    }
     
    front(){
        return this.queue[0];
    }
     
 }
 
 function addHelper(url){
        // returns a promise
        return rp(url).then(body => {
            // make the count be the resolved value of the promise
            let responseJSON = JSON.parse(body);
            return {
                id: responseJSON.items[0].id,
                title: responseJSON.items[0].snippet.title,
                img: responseJSON.items[0].snippet.thumbnails.default.url
            };
        });
    }
 
 module.exports = {Queue};