const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//User structure represent a user by:
//id (unique per person), username , email
let User = new Schema({
    email: {
        type: String , required: true , unique: true
    },
    password: {
        type: String , required: true
    },
    color: {
        type: String
    },
    font: {
        type: String
    }
});

module.exports = mongoose.model('User' , User);