
class Users {
    constructor(){
        this.users=[]
    }
    
    addUser(id, name){
        var user = {id, name};
        this.users.push(user);
        return user;
    }
    
    removeUser(id){
        var user = this.getUser(id);
        if(user){
            this.users = this.users.filter((user) => user.id !== id);
        }
        return user;
    }
    
    getUser(id){
        return this.users.filter((user) => user.id ===id)[0];
    }
    
    getUserList(){
        var nameArray = this.users.map(function(user){
            return user.name;
        });
        return nameArray;
    }
    
    
}

module.exports = {Users};