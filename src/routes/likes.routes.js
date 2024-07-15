import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { allLikedVideo, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/likes.controller.js";

const router = Router();

router.route("/like-video/:videoId").get(verifyJWT,toggleVideoLike)
router.route("/like-comment/:commentId").get(verifyJWT,toggleCommentLike)
router.route("/like-tweet/:tweetId").get(verifyJWT,toggleTweetLike)
router.route("/get-liked-videosByUser").get(verifyJWT,allLikedVideo)


export default router
