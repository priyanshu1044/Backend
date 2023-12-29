import {Router} from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();


router.route("/register").post(
    upload.fields([
        {name:"avatar",maxCount:1},
        {name:"coverImage",maxCount:1}
    ]),registerUser)


router.route("/login").post(loginUser)


//secured route
router.route("/logout").post( verifyJWT, logoutUser)
router.route("/refreshToken").post( refreshAccessToken)
router.route("/changePassword").post( verifyJWT, changeCurrentPassword)
router.route("/currentUser").get( verifyJWT, getCurrentUser)
router.route("/updateAccountDetails").post( verifyJWT, updateAccountDetails)

router.route("/updateUserAvatar").post( verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/updateUserCoverImage").post( verifyJWT, upload.single("/coverImage"), updateUserCoverImage)
router.route("/getUserChannelProfile/:username").get( getUserChannelProfile)
router.route("/getWatchHistory").get( verifyJWT, getWatchHistory)

export default router;