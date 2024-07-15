import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, getAllPlaylist, getPlaylistById, removeVideoFromPlaylist } from "../controllers/playlist.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
// router.use(upload.none())
router.route("/add-playlist").post(verifyJWT,upload.single("thumbnail"),createPlaylist)
router.route("/add-video-playlist/:playlistId/:videoId").post(verifyJWT,upload.none(),addVideoToPlaylist)
router.route("/remove-video-playlist/:playlistId/:videoId").post(verifyJWT,upload.none(),removeVideoFromPlaylist)
router.route("/get-playlist/:playlistId").get(verifyJWT,getPlaylistById)
router.route("/get-all-user-playlist/:userId").get(getAllPlaylist)

export default router
