import {Router} from "express"
import { changeCurrentPassword, generateRefreshAccessToken, getCurrentUser, getUserById, getUserChannelProfile, getWatchedHistory, loginHandler, logOut, updateAccount, updateAvatar, updateCoverImage, userHandler } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([  // fields is allowed to set multiple files either another field 
                    //we can use array but it is used to store multiple files in single field
       {
        name: "avatar",
        maxCount:1
       },
       {
        name: "coverImage",
        maxCount: 1
       }
    ]),
    userHandler)

    router.route("/login").post(upload.none(),loginHandler);

    router.route("/logout").post(verifyJWT,logOut)

    router.route("/refresh-token").post(generateRefreshAccessToken)

    router.route("/changeCurrentPassword").post(verifyJWT,changeCurrentPassword);

    router.route("/getCurrentUser").get(verifyJWT,getCurrentUser);

    router.route("/update-account-det").patch(verifyJWT,updateAccount)

    router.route("/updateAvatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);//add multer with my opinion

    router.route("/updateCoverImage").patch(verifyJWT,upload.single("coverImage"),updateCoverImage);//add multer with my opinion

    router.route("/c/:userId").get(verifyJWT,getUserChannelProfile) 

    router.route("/history").get(verifyJWT,getWatchedHistory)

    router.route("/get-user/:userId").get(getUserById);
    

export default router