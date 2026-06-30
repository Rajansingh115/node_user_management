const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const saltRounds = 10;

// Api for user register
const createUser = async (req, res) => {
    try {
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await User.create({ ...req.body, password: hashedPassword });
        res.status(201).json({success: true, user});
    } catch (error) {
        console.error(error);
        res.status(500).json({
        error: error.message,
    });
    }
};

// Api for user login 
const loginUser = async (req,res)=>{
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email}).select("+password");
        if(!user){
            return res.status(404).json({success:false, message:"user not found"})
        }
        console.log("Entered Password:", password);
        console.log("Stored Hash:", user.password);
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({success:false, message:"Invalid Password"})
        }
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        const refreshToken = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        });
        user.refreshToken = refreshToken;
        user.lastLoginAt = new Date();
        await user.save();
        user.password = undefined;
        user.refreshToken = undefined;
        res.status(200).json({success: true, message:"Login successfully", user, token, refreshToken})
    } catch (error) {
        console.log(error)
        res.status(500).json({error:error.message});
        }
}

// Api for get all user 
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Api for update user Data
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, req.body , { new: true,runValidators: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ error: error.message });
    }
};

// Api for delete user
const deleteUser = async (req, res)=>{
    try{
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id)
        if(!user){
            return res.status(404).json({error: "User not found"})
        }
        res.status(200).json({user, message: "user deleted successfully"})
    }catch(error){
        console.log(error);
        res.status(500).json({error: error.message})
    }
}
    
// Api for forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        user.resetOtp = otp;
        user.otpExpire = new Date(
            Date.now() + 5 * 60 * 1000
        );

        await user.save();

        await sendEmail(
            email,
            "Password Reset OTP",
            `Your OTP is ${otp}`
        );

        res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// API for reset password with otp
const resetPasswordWithOtp = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.resetOtp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({ error: "OTP has expired" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        user.password = hashedPassword;
        user.resetOtp = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

// API for Refresh Token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );
        const user = await User.findById(decoded.id).select("+refreshToken");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }
        const accessToken = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN,
            }
        );
        res.status(200).json({
            success: true,
            accessToken
        });

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Refresh token expired or invalid"
        });
    }
};

module.exports = {createUser,getUsers,updateUser,loginUser, deleteUser,forgotPassword, resetPasswordWithOtp, refreshToken};