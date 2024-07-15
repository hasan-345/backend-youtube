import mongoose, { mongo } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Comment } from "../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})


const addComment = asyncHandler(async(req,res)=>{

    const {videoId} = req.params;
    const {content} = req.body;


    if(!(videoId && content)){
        throw new ApiError(400,"video id and content is required");
    }

    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if(!newComment){
        throw new ApiError(400,"Add comment is failed")
    }

    return res.status(200).json(new ApiResponse(200,newComment,"success"))
})

const updateComment = asyncHandler(async(req,res)=>{

    const {commentId} = req.params;
    const {content} = req.body;
   const user = req.user?._id;

    if(!(commentId && content)){
        throw new ApiError(200,"commentId and content are required")
    }

    const checkCommentVerify = await Comment.findOne({_id: commentId, owner: user})

    if(!checkCommentVerify){
        return res.status(404).json(new ApiResponse(404,"Comment not found or not owned by user"))
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content
        }
    },{
        new: true
    })

    if (!updatedComment) {
        throw new ApiError(400,"Updated comment failed")
    }

    return res.status(200).json(new ApiResponse(200,updatedComment,"success"))
})

const deleteComment = asyncHandler(async (req, res) => {

    const {commentId} = req.params;
    const user = req.user?._id;

    if(!commentId){
        throw new ApiError(200,"commentId are required")
    }

    const checkCommentVerify = await Comment.findOne({_id: commentId, owner: user})

    if(!checkCommentVerify){
    return res.status(404).json(new ApiResponse(404,{},"Comment not found or not owned by user"))
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

   if (!deletedComment) {
      throw new ApiError(500,"server failed to delete comment")
   }

    return res.status(200).json(new ApiResponse(200,{},"successfully deleted"))
})

const getAllCommentsOfVideo = asyncHandler(async(req,res)=>{
      
    const {userId} = req.params;

   if (!videoId) {
      throw new ApiError(404,"VideoId is required")
   }
    try {
    const comments = await Comment.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    if (!comments) {
        return res.status(404).json(new ApiResponse(404,null,"Not have comments || server issue"))
    }
    

    return res.status(200).json(new ApiResponse(200,comments,"successfully fetched comments"))

    } catch (error) {
        
    }
})


export {
    addComment,
    updateComment,
    deleteComment,
    getAllCommentsOfVideo
}