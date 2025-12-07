const mongoose = require('mongoose');
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    minlength: 2,
    maxlength: 50,
},
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value){
        if(!validator.isEmail(value)){
            throw new Error("Email is invalid");
        }
    }
  },
   password: {
    type: String,
    required: true,
    minlength: 2,
    validate(value){
        if(!validator.isStrongPassword(value)){
            throw new Error("Password is weak" + value);
        }
    }
  },
},
{
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
