import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteOnCloudinary } from "../utils/cloudinaryDelete.js";
import { User } from "../models/user.model.js";
import fs from "fs"
import mongoose from "mongoose";

const uploadVideo = asyncHandler(async( req,res)=>{

   const {title,description} = req.body;

   if(
    [title,description].some((item)=> item?.trim() === "")
   ){
    throw new ApiError(400,"All field are required");
   }

  const videoPath = req.files?.videoFile[0]?.path;
  const thumbnailPath = req.files?.thumbnail[0]?.path;

  if (!(videoPath && thumbnailPath)) {
    throw new ApiError(400,"video and thumbnail are required")
  }

   try {
    const video = await uploadOnCloudinary(videoPath);
    const thumbnail = await uploadOnCloudinary(thumbnailPath);
 
    if (!(video?.url && thumbnail?.url)) {
     throw new ApiError(500,"Upload video failed")
    }
 
    const uploadedVideo = await Video.create({
     videoFile: video?.url,
     thumbnail: thumbnail?.url,
     description,
     duration: video?.duration,
     isPublished : true,
     owner: req.user,
     title,
    }) 
 
    const verifiedVideoUploaded = await Video.findById(uploadedVideo?._id);
 
    if(!verifiedVideoUploaded){
     throw new ApiError(500,"Video upload failed")
    }
 
    fs.unlinkSync(videoPath);
     fs.unlinkSync(thumbnailPath);
 
    return res.status(200).json(new ApiResponse(200,verifiedVideoUploaded,"Successfully uploaded"))
 
   } catch (error) {
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);

    // Handle specific errors if necessary
    throw error;
   }

})

const getAllVideos = asyncHandler(async(req,res)=>{

    const videos = await Video.aggregate([{$match: {}}]);
    
    if (!videos) {
        return res.status(404).json(new ApiResponse(404,null,"Not have videos or server failed"))
    }

    return res.status(200).json(new ApiResponse(200,videos,"successfully all fetched videos"))
})

const getAllVideosOfUser = asyncHandler(async(req,res)=>{
    const {userId} = req.params;


   try {
     const videos = await Video.aggregate([{$match: {owner: new mongoose.Types.ObjectId(userId)}}]);
     
     if (!videos) {
         return res.status(200).json(new ApiResponse(200,null,"Not have videos or server failed"))
     }
 
     return res.status(200).json(new ApiResponse(200,videos,"successfully all fetched videos"))
   } catch (error) {
    throw new ApiError(500,"Unsuccessfully fetched getAllVideosOfUser ")
   }
})

const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(200,"Video id is required")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(500,"Video failed.")
    }
    
    const user = await User.findById(req.user?._id);

    if(!user){
        return res.status(404).json(new ApiResponse(404,{},"Please login or signup before acces this video"))
    }

   if (!user.watchHistory.includes(videoId)) {
       user.watchHistory?.push(videoId);
      await user.save(); 
   }



    return res.status(200).json(new ApiResponse(200,video,"Successfully got video"))
})


const addViewsOfVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const user = req.user?._id 
    if (!videoId) {
        throw new ApiError(500,"VideoId is required")
    }
  
        const userIdConverted = new mongoose.Types.ObjectId(user)
        const checkAlreadyViewed = await Video.findById(videoId);
     
        console.log(checkAlreadyViewed)
        if (checkAlreadyViewed.views.includes(userIdConverted)) {
       
            return res.status(200).json(new ApiResponse(200,checkAlreadyViewed,"successfully"))
       
        }else{
           checkAlreadyViewed.views.push(userIdConverted);
    
           await checkAlreadyViewed.save();
    
    
           return res.status(200).json(new ApiResponse(200,checkAlreadyViewed,"successfully"))
        }

})



const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description} = req.body;
    const thumbnail = req.file?.path;
   const user = req.user?._id
    if(
        [title,description,thumbnail,videoId].some((item)=> item?.trim() === "")
       ){
        throw new ApiError(400,"All field are required");
       }
     
    const checkVideoVerify = await Video.findOne({_id: videoId, owner: user})

    if(!checkVideoVerify){
        return res.status(404).json(new ApiResponse(404,{},"video is not found or not owned by user"))
        }



    const url = checkVideoVerify?.thumbnail;

    if (!url) {
        throw new ApiError(500,"failed to edit video")
    }

    const publicId = url.split('/').slice(-1)[0].split('.')[0];

    const deleteThumbnail = await deleteOnCloudinary(publicId);

    if(!deleteThumbnail){
        throw new ApiError(500,"Server failed to upload thumbnail")
    }


    const newThumbnailLocalPath = req.file?.path;

    if(!newThumbnailLocalPath){
        throw new ApiError(400,"Thumbnail is required")
    }

     const uploadThumbnailOnCloudinary = await uploadOnCloudinary(newThumbnailLocalPath)

     if(!uploadThumbnailOnCloudinary){
        throw new ApiError(400,"Thumbnail is failed to upload")
    }

    const updatedAllGivenFields = await Video.findByIdAndUpdate(videoId,{
        $set:{
            title,
            description,
            thumbnail: uploadThumbnailOnCloudinary?.url
        }
    },{
        new: true
    })

    if(!updatedAllGivenFields){
        throw new ApiError(500,"Server error to update video")
    }

    return res.status(200).json(new ApiResponse(200,updatedAllGivenFields,"Successfully updated video"))

})

const deleteVideo = asyncHandler(async(req,res)=>{
     const {videoId} = req.params;

     const user = req.user?._id
     if(!videoId){
        throw new ApiError(400,"video id is required")
     }

     const video = await Video.findOneAndDelete({owner: user,_id: videoId});

     if(!video){
        return res.status(404).json(new ApiResponse(404,{},"video is not found or not owned by user"))
        }

     return res.status(200).json(new ApiResponse(200,{},"success"))
})


export {
    uploadVideo,
    getVideoById,
    deleteVideo,
    updateVideo,
    getAllVideos,
    addViewsOfVideo,
getAllVideosOfUser
}