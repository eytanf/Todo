const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//Task structure represent a task by:
//id,task(what to do),if it's completed,if its need to be removed.
let Task = new Schema({
    task: {
        type: String , trim: true
    },
    complete: {
        type: Boolean , default: false 
    },
    taskOwnerId: {
        type: String
    }
});

module.exports = mongoose.model('Task' , Task);