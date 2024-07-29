import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {Playlist} from "../models/playlist.model.js"
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs"

const createPlaylist = asyncHandler(async(req,res)=>{
     const {name,description} = req.body;
     const thumbnailLocalPath = req.file?.path
     if(!(name && description && thumbnailLocalPath)){
        throw new ApiError(400,"playlist name and description, thumbnail are required")
     }


    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
        throw new ApiError(500,"Upload thumbnailfailed")
    }


     const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
        thumbnail: thumbnail?.url
     })

     fs.unlinkSync(thumbnailLocalPath)
     return res.status(200).json(new ApiResponse(200,playlist,"successfully created playlist"))
})

const getPlaylistById = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;

   if (!playlistId) {
     throw new ApiError(400,"playlist id is required")
   }

   const playlist = await Playlist.aggregate([
    {
        $match: {
            _id: new mongoose.Types.ObjectId(playlistId)
        }
    },{
        $lookup:{
            from : "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos",
            pipeline:[
                {
                    $project:{
                        _id: 1,
                        title: 1,
                        description: 1,
                        views: 1,
                        videoFile: 1,
                        thumbnail: 1,
                        duration: 1,
                        owner: 1,
                        createdAt: 1

                    }
                }
            ]
        }
    }
   ])

   if (!playlist) {
     return res.status(404).json(new ApiResponse(404,{},"Not have playlist"))
   }



    // const playlist = await Playlist.findById({_id:playlistId,owner: req.user?._id});

    // if (!playlist) {
    //     throw new ApiError(500,"server failed to fetched playlist")
    // }

    return res.status(200).json(new ApiResponse(200,playlist,"successfully playlist fetched"))
})

const getAllPlaylist = asyncHandler(async(req,res)=>{
    const {userId} = req.params;

    if (!userId) {
        throw new ApiError(404,"userId is required")
    }

    try {
        const playlists = await Playlist.find({owner: userId});

        if (!playlists) {
            return res.status(200).json(new ApiResponse(200,playlists,"Successfully fetched playlist"))
        }

        return res.status(200).json(new ApiResponse(200,playlists,"Successfully fetched playlist"))
        
    } catch (error) {
        throw new ApiError(500,"Unsuccessfully failed to fetch playlist")
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    if (!(playlistId && videoId)) {
        throw new ApiError(400,"playlistId and videoId are required")
    } 

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
         return res.status(404).json(new ApiResponse(404,"server failed to save video || Unauthorized person added video "))
    }

    if (playlist.videos?.includes(videoId)) {
        return res.status(404).json(new ApiResponse(404,{},"Already added video"))
    }else{
        playlist.videos?.push(videoId)
        await playlist.save();
    }

    return res.status(200).json(new ApiResponse(200,playlist,"successfully added video"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    const user = req.user?._id;
    if (!(playlistId && videoId)) {
        throw new ApiError(400,"playlistId and videoId are required")
    } 
    
    const checkVerify = await Playlist.findOne({_id: playlistId, owner: user})
    if(!checkVerify){
        return res.status(404).json(new ApiResponse(404,{},"Unauthrized person access or server issue"))
    }

    const playlist = await Playlist.updateOne({_id: playlistId,owner: user}, { $pull: {videos: videoId}})

    if (!playlist) {
        throw new ApiError(500,"server failed to save video || Unauthorized person added video ")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"successfully removed video"))
    



})

export {
    getPlaylistById,
    createPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getAllPlaylist
}