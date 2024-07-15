import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

//configuration
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json({limit:"1gb"}));
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(cookieParser());

import userRoutes from "./routes/user.routes.js"
import videoRoutes from "./routes/video.routes.js"
import likeRoutes from "./routes/likes.routes.js"
import commentRoutes from "./routes/comment.routes.js"
import subscriptonRoutes from "./routes/subscription.routes.js"
import playlistRoutes from "./routes/playlist.routes.js"
import tweetRoutes from "./routes/tweet.routes.js"

app.use("/api/v2/users",userRoutes);
app.use("/api/v2/video",videoRoutes);
app.use("/api/v2/like",likeRoutes)
app.use("/api/v2/comment",commentRoutes)
app.use("/api/v2/subscription",subscriptonRoutes)
app.use("/api/v2/playlist",playlistRoutes)
app.use("/api/v2/tweet",tweetRoutes)

export default app;