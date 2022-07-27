const mongoose = require("mongoose")

const userSchema = mongoose.Schema({

    fname:
    {
        type: String,
        require: true,
        trim: true
    },
    lname: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        trim: true
    },

    profileImage: {
        type: String,
        require: true,
        trim: true
    }, // s3 link
    phone: {
        type: String,
        require: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        require: true,
        trim: true
    }, // encrypted password
    address: {
        shipping: {
            street: {
                type: String,
                require: true,
                trim: true
            },
            city: {
                type: String,
                require: true,
                trim: true
            },
            pincode: {
                type: Number,
                require: true,
                trim: true
            }
        },
        billing: {
            street: {
                type: String,
                require: true,
                trim: true
            },
            city: {
                type: String,
                require: true,
                trim: true
            },
            pincode: {
                type: Number,
                require: true,
                trim: true
            }
        }
    }

}, { timestamps: true })
module.exports = mongoose.model("User", userSchema);