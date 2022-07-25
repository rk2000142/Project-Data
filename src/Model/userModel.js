const mongoose = require("mongoose")

const userSchema = mongoose.Schema({

    fname:
    {
        type: string,
        require: true
    },
    lname: {
        type: string,
        require: true
    },
    email: {
        type: string,
        require: true,
        unique: true
    },

    profileImage: {
        type: string,
        require: true
    }, // s3 link
    phone: {
        type: string,
        require: true,
        unique: true
    },
    password: {
        type: string,
        require: true,
        min: 8,
        max: 15
    }, // encrypted password
    address: {
        shipping: {
            street: {
                type: string,
                require: true
            },
            city: {
                type: string,
                require: true
            },
            pincode: {
                type: Number,
                require: true
            }
        },
        billing: {
            street: {
                type: string,
                require: true
            },
            city: {
                type: string,
                require: true
            },
            pincode: {
                type: Number,
                require: true
            }
        }
    }

},{timestamps:true})
module.exports = mongoose.model("User",userSchema);