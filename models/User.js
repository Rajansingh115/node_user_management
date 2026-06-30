const mongoose = require("mongoose");
 
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // hide password by default
    },

    resetOtp: {
    type: String,
    default: null
    },

    otpExpire: {
      type: Date,
      default: null
    },
      role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
    },
    profileImage: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false, // hide refresh token by default
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);