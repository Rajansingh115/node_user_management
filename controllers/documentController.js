const User = require("../models/User");

const uploadProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                profileImage: req.file.filename
            },
            {
                new: true
            }
        );

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

module.exports = { uploadProfile };