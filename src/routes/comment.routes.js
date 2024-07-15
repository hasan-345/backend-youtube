import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getAllCommentsOfVideo, updateComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/add-comment/:videoId").post(verifyJWT,addComment)
router.route("/update-comment/:commentId").post(verifyJWT,updateComment)
router.route("/delete-comment/:commentId").get(verifyJWT,deleteComment)
router.route("/getAll-comments/:userId").get(verifyJWT,getAllCommentsOfVideo)

export default router