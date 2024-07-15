import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(upload.none())
router.route("/create-tweet").post(verifyJWT,createTweet)
router.route("/get-all-user-tweets/:userId").get(verifyJWT,getUserTweets)
router.route("/delete-tweet/:tweetId").get(verifyJWT,deleteTweet)
router.route("/update-tweet/:tweetId").patch(verifyJWT,updateTweet)

export default router
