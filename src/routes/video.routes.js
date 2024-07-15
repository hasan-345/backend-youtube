import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addViewsOfVideo, deleteVideo, getAllVideos, getAllVideosOfUser, getVideoById, updateVideo, uploadVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/uploadVideo").post(verifyJWT,upload.fields([
    {
        name: "thumbnail",
        maxCount: 1
    },
    {
        name: "videoFile",
        maxCount: 1
    }
]),uploadVideo)

router.use(upload.none())

router.route("/getVideo/:videoId").get(verifyJWT,getVideoById);
router.route("/update-video/:videoId").patch(verifyJWT,upload.single("thumbnail"),updateVideo)
router.route("/delete-video/:videoId").get(verifyJWT,deleteVideo)
router.route("/get-all-videos").get(getAllVideos)
router.route("/addViews/:videoId").post(verifyJWT,addViewsOfVideo)
router.route("/getAllVideosUser/:userId").get(verifyJWT,getAllVideosOfUser)

export default router