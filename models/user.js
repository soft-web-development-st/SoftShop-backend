const mongoose = require("mongoose");
const validator = require("validator");
const bycrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxlength: [30, "Your name cannot exceed 30 charaters"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [6, "Your password cannot be less than 6 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resertPasswordToken: String,
  resertPasswordExpire: Date,
});

// Encrypting password before savind user

userSchema.pre('save', async function(next){
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bycrypt.hash(this.password, 10)
})

//compare password

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bycrypt.compare(enteredPassword, this.password)
}

// return JWT token 

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

// generate password reset token

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    // hash and set to resetPasswordToken

    this.resertPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // set token expired time

    this.resertPasswordExpire = Date.now() + 30 * 60 * 1000;

    return resetToken;
}


module.exports = mongoose.model("User", userSchema);
