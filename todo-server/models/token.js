const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//Token structure represent a token and a user holding it by:
//_id (unique per person), token(unique) 
let Token = new Schema({
    token: {
        type: String , required: true , unique: true
    },
    userId: {
        type: String , required: true 
    }
});

module.exports = mongoose.model('Token' , Token);