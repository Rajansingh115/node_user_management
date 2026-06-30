const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const userController = require("../controllers/userController");
const documentController = require("../controllers/documentController");


router.post("/user-register", userController.createUser);
router.get("/user-list", authMiddleware, userController.getUsers);
router.put("/user-update/:id", authMiddleware, userController.updateUser);
router.post("/user-login", userController.loginUser);
router.delete("/user-delete/:id", authMiddleware, userController.deleteUser);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password-with-otp", userController.resetPasswordWithOtp);
router.post("/upload-image/:id", authMiddleware, uploadMiddleware.single("profileImage"), documentController.uploadProfile);
router.post("/refresh-token", userController.refreshToken);

module.exports = router;