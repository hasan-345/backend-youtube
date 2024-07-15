import mongoose, { mongo } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Likes } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const user = req.user?._id

    if (!videoId) {
        throw new ApiError(400,"Video Id is required")
    }
    
    const existedLikedVideo = await Likes.findOne({video: videoId, likeBy: user})

    if (existedLikedVideo) {
    const deletedLiked = await Likes.findOneAndDelete({video: videoId, likeBy: user})
       return res.status(200).json( new ApiResponse(200,deletedLiked,"Unliked video"))
    }
     
    const like = await Likes.create({
        video: videoId,
        likeBy: user 
    })

    if(!like){
        throw new ApiError(500,"server is failed to save likes")
    }

    return res.status(200).json(new ApiResponse(200,like,"successfully toggledLikedVideo"))
})

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;
    
    const user = req.user?._id

    if (!commentId) {
        throw new ApiError(400,"commentId is required")
    }

    const isAlreadyLikedComment = await Likes.findOne({comment: commentId,likeBy: user})

    if (isAlreadyLikedComment) {
        await Likes.findOneAndDelete({comment: commentId,likeBy: user});
        return res.status(200).json( new ApiResponse(200,{},"Unliked comment"))
     }

    const likedComment = await Likes.create({
        comment: commentId,
        likeBy: user
    })

    if(!likedComment){
        throw new ApiError(500,"server failed to save liked comment")
    }

    return res.status(200).json(new ApiResponse(200,likedComment,"Successfully liked comment"))
})

const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    
    const user = req.user?._id

    if (!tweetId) {
        throw new ApiError(400,"tweetId is required")
    }

    const isAlreadyLikedTweet = await Likes.findOne({tweet: tweetId,likeBy: user})

    if (isAlreadyLikedTweet) {
        await Likes.findOneAndDelete({tweet: tweetId,likeBy: user})
        return res.status(200).json( new ApiResponse(200,{},"Unliked tweet"))
     }

    const tweetComment = await Likes.create({
        tweet: tweetId,
        likeBy: user
    })

    if(!tweetComment){
        throw new ApiError(500,"server failed to save liked tweet")
    }

    return res.status(200).json(new ApiResponse(200,tweetComment,"Successfully liked tweet"))
})


const allLikedVideo = asyncHandler(async(req,res)=>{

    const user = req.user?._id;

    const likedVideo = await Likes.aggregate([
        {
            $match:{
                likeBy: new mongoose.Types.ObjectId(user)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideobyuser"
            }
        }

    ])

    if (!likedVideo) {
        return res.status(404).json(new ApiResponse(404,null,"have not any liked video or server issues"))
     }
     
     return res.status(404).json(new ApiResponse(404,likedVideo[2],"have not any lik video or server issues"))

})



export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    allLikedVideo
}