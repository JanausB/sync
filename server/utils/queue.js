 class Queue{
    constructor(){
        this.queue=[]
    }
    
    add(id){
        this.queue.push(id);
        return id;
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
 
 module.exports = {Queue};