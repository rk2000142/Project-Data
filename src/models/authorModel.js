const mongoose = require('mongoose');
//const validator = require('validator');

const authorSchema = new mongoose.Schema( {
     title: {
        type: String,
        enum: ["Mr", "Mrs", "Miss"],
        required: true
    },
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
   
    email:{
        type: String,
        unique: true,
        required: true 
    },
    password: {
        type: String,
        required: true
    },
   
   
}, { timestamps: true });

module.exports = mongoose.model('Author', authorSchema) 