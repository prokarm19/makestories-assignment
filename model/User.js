const mongoose = require('mongoose');


const UserSchema  = new mongoose.Schema({
    firstname:{
        type: String,
    },
    lastname:{
        type: String
    },
    phone:{
        type: Number
    },
    email:{
        type : String,
        required: true,
        unique:true
    },
    hashed_password:{
        type: String,
        required: true
    },
    age:{
        type: String,
        default: 18
    },
    address:{
        type: String,
        default:"FLAT/BUILDING Street, City"
    },
    image:{
        type: Buffer
    }

},{timestamps: true}
);
module.exports = User = mongoose.model('User', UserSchema);

