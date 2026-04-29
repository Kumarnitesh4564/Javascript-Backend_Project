import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
    updateCurrentUserDetails,
    updateCurrentUserAvatar, 
    updateCurrentUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory 
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWTToken } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser);

// secured routes - need to verify JWT token before allowing access to these routes

router.route("/logout").post(verifyJWTToken, logoutUser);

router.route("/refresh-token".post(refreshAccessToken));

router.route("/change-password").post(verifyJWTToken, changeCurrentPassword);

router.route("/current-user").get(verifyJWTToken, getCurrentUser);

router.route("/update-user").patch(verifyJWTToken, updateCurrentUserDetails);

router.route("/update-avatar").patch(verifyJWTToken, upload.single("avatar"), updateCurrentUserAvatar);

router.route("/update-cover-image").patch(verifyJWTToken, upload.single("coverImage"), updateCurrentUserCoverImage);

router.route("/channel/:username").get(verifyJWTToken, getUserChannelProfile);

router.route("/watch-history").get(verifyJWTToken, getWatchHistory);


export default router;