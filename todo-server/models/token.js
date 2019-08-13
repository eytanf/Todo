const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//Token structure represent a token and a user holding it by:
//_id (unique per person), token(unique) 
let Token = new Schema({
    token: {
        type: String 
    },
    userId: {
        type: String 
    }
});

module.exports = mongoose.model('Token' , Token);