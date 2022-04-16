const User=require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto')
const cloudinary = require('cloudinary')

exports.registerUser = async(req, res,next) => {

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: 'avatars',
        width: 150,
        crop: 'scale'
       
    }, (error, result) => {
        console.log(error,result);
    })
    
    const { name, email, password } = req.body;

    console.log(result);

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    })
    console.log(user);

    sendToken(user, 200, res)
    
}

// login user => 'api/v1/login

exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    // checks if email and password is entered by user

    if (!email || !password) {
        return next('Please enter email & password', 400)
    }
    //finding user in database

    const user = await User.findOne({ email }).select('+password')
  
    
    if (!user) {
        return next('Invalid Email or Password', 401);
    }

    // check if password is correct or not

    const isPasswordMathed = await user.comparePassword(password);

   

    if (!isPasswordMathed) {
        return next("Invalid Email or Password", 401);
    }

    sendToken(user, 200, res);
}

// forgot password

// Forgot Password   =>  /api/v1/password/forgot///////////

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

    try {

        await sendEmail({
            email: user.email,
            subject: 'ShopIT Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500))
    }

})

//////////////////////////////////////////////////////////



// Reset Password   =>  /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    console.log(user);

    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400))
    }

    // Setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)

})



exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})


//update /change password => api/v1/password/update


exports.updatePassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password')

    // check previous user password

    const isMatched = await user.comparePassword(req.body.oldpassword)
    
    if (!isMatched) {
        return next(new ErrorHandler('Old password is incorrect ', 400));

    }

    user.password = req.body.password;
    await user.save();
    sendToken(user, 200, res);
})


// update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => { 

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    //update avatar

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify:true
    })
    res.status(200).json({
        success:true
    })


})







// logout user

exports.logout = catchAsyncErrors( async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httponly: true
    })
    res.status(200).json({
        success: true,
        message: 'Logged Out'
    })
})


// Admin routes


//Get all users 

exports.allUsers = catchAsyncErrors(async (req, res, next) => {

    const users = await User.find({});

     res.status(200).json({
         success: true,
    
      users
     });
})
 
// get user detail

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User not found ", 400));
  }
    res.status(200).json({
        success: true,
        user
    })
})

// update user 

exports.updateUser= catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
      email: req.body.email,
    role: req.body.role
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });
  res.status(200).json({
    success: true,
  });
});

// delete user

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User not found ", 400));
  }

    //Remover avatar from cloudinary - todo


    await user.remove();
    
  res.status(200).json({
    success: true,
    message :'User Deleted '
  });
});
