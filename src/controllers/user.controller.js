import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import fs from "fs"
import { error } from "console";
import mongoose, { mongo } from "mongoose";

const generateRefereshAndAccessToken = async(userId)=>{
      try {
        const user = await User.findById(userId);

      const refreshToken =  user.generateRefreshToken()
      const accessToken = user.generateAccessToken()

      user.refreshToken = refreshToken
       await  user.save({
        validateBeforeSave: false
      })

      return {refreshToken,accessToken}
          //it means it will just to save it without disturb any other value
      } catch (error) {
        
        throw new ApiError(500,"Something went wrong while generating referesh and access token")
      }
}



const userHandler = asyncHandler(async (req,res)=>{
     //1.get details of user from frontend  
    const {fullName,email,username,password} = req.body;
    // console.log(req.body)
    //2.validation
    if(
        [fullName,email,username,password].some((field)=> field?.trim() === "")
    ){
       throw new ApiError(400,"All fields are required");
    }
    
    //3.check user already existed
    // User.findOne({email}) //when we check with just email but i want to check through email or username
    try {
       const existedUserCheck = await User.findOne({
          $or:[{email},{username}]
         });
  
         if(existedUserCheck){
           throw new ApiError(409,"Already Existed please login")
         }
    
         //4.check for images and avatar
         const avatarLocalPath = req.files?.avatar[0]?.path
         let coverImageLocalPath = null; //cannot read property error due to this line
                                           //similar to above line
                                           //it gives error when it is not uploaded. 
         if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
          coverImageLocalPath = req.files.coverImage[0].path;
         }
  
        //  console.log(avatarLocalPath);
         if (!avatarLocalPath) {
           throw new ApiError(409,"Avatar image is required");
         }
           
  
         
         //5.upload images on cloudinary
         const avatar = await uploadOnCloudinary(avatarLocalPath)
         const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  
         if(!avatar){
          throw new ApiError(409,"Avatar image is failed to upload");
         }
          
         //6.created user object
         const response = await User.create({
  
          fullName,
          avatar: avatar.url,
          coverImage: coverImage?.url || "",
          email,
          username: username.toLowerCase(),
          password
         })
  
      console.log(response);
         //7.remove password and refresh token
         const createdUser = await User.findById(response._id).select(
         "-password -refreshToken" 
         )  //values must be matched with models properties
        //select() is used to remove object properties or must be
        //- means properties should not be added and + means just addes
  
        //8.check for user creation
        // console.log(createdUser)
        if(!createdUser){
          throw new ApiError(500,"Something went wrong while registering");
        }
  
        fs.unlinkSync(avatarLocalPath)
        if(coverImageLocalPath){
          fs.unlinkSync(coverImageLocalPath)
        }
        //9.returns response in object form
        return res.status(201).json( 
          new ApiResponse(200,createdUser,"Succes")
        )
    } catch (error) {
      if (fs.existsSync(videoPath)) fs.unlinkSync(avatarLocalPath);
    if (fs.existsSync(thumbnailPath)) fs.unlinkSync(coverImageLocalPath);
      throw new ApiError(500,"server issues")
    }
})

const loginHandler  = asyncHandler(async(req,res)=>{

     const {email,password} = req.body;

     if(!(email)){
      throw new ApiError(400,"username or email is required");
     }
      
      const existedUser = await User.findOne({
    email
     })

     if(!existedUser){
      throw new ApiError(404,"user does not exist");
     }

  const checkPassword = await existedUser.isPasswordCorrect(password)
 
  if(!checkPassword){
    throw new ApiError(401,"Invalid user credentials");
   }

   const {refreshToken,accessToken} = await generateRefereshAndAccessToken(existedUser._id);

   const loggedIn = await User.findById(existedUser._id).select(
    "-password -refreshToken"
   )
   
   const options = {
     httpOnly : true,
     secure: true
   }
   return res.status(200)
   .cookie("refreshToken",refreshToken,options)
   .cookie("accessToken",accessToken,options)
   .json(new ApiResponse(200,loggedIn,"Success"))  

      

})


const logOut = asyncHandler(async(req,res)=>{
  
 await User.findByIdAndUpdate(req.user._id,{
    $unset: {
      refreshToken:1
    },
    
 },
 {
  new : true //it means it will return new object with updated values
}
)

const options = {
  httpOnly : true,
  secure: true
}

return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"User loggedOut Successfully"))

})

const generateRefreshAccessToken = asyncHandler(async(req,res)=>{
       const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken 
       if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized refreshToken")
      }
       try {
        const decodedToken = jwt.verify(
         incomingRefreshToken,
           process.env.REFRESH_TOKEN_SECRET
         )
 
         const user = await User.findById(decodedToken?._id)
         if(!user){
           throw new ApiError(401,"Unauthorized user")
         }
 
         if(incomingRefreshToken !== user?.refreshToken){
           throw new ApiError("Unauthorized refrsh token")
         }
 
         const {newRefreshToken,accessToken} = await generateRefereshAndAccessToken(user?._id);
         const options = {
           httpOnly : true,
           secure: true
         }
         return res.status(200).cookie("refreshToken",newRefreshToken,options)
         .cookie("accessToken",accessToken,options)
         .json(new ApiResponse(200,{
           refreshToken: newRefreshToken,
           accessToken
         },
       "Token is refreshed successfully"
       ))
       } catch (error) {
        throw new ApiError(400,error?.message || "Invalid refresh token")
       }
     
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
          
  const {oldPassword,newPassword} = req.body;

  if(!(oldPassword && newPassword)){
   throw new ApiError(401,"All fields are required")
  }

  const user = await User.findById(req.user?._id)

   const checkPassword = await user.isPasswordCorrect(oldPassword);

   if(!checkPassword){
     throw new ApiError(301,"Old password is incorrect")
   }

 user.password = newPassword;

await user.save({
 validateBeforeSave: false
 })

 return res.status(200).json(new ApiResponse(201,{},"Your password is changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{

  return res.status(200).json(new ApiResponse(201,req.user,"Successfully"))

})

const updateAccount = asyncHandler(async(req,res)=>{
  const {email,fullName} = req.body;

   if (!(email || fullName)) {
      throw new ApiError(400,"Email and password is required");
   }

   const user = await User.findByIdAndUpdate(req.user?._id,{
    $set:{
      email,
      fullName
    }
   },{
    new: true
  }).select(
    "-password -refreshToken"
  )
     return res.status(200).json(new ApiResponse(201,user,"Succesfully account updated"))
})

const updateAvatar = asyncHandler(async(req,res)=>{
     const newAvatar = req.file?.path; //changes with my opinion
      
     if(!newAvatar){
      throw new ApiError(400,"Avatar is required");
     }

     const avatar = await uploadOnCloudinary(newAvatar)

     if(!avatar){
      throw new ApiError(500,"Avatar is not uploaded on server");
     }

      const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar: avatar?.url,
        }
      },{
        new: true
      }).select(
        "-password -refreshToken"
      )

      return res.status(200).json(new ApiResponse(201,user,"Succesfully updated Avatar"))
})


const updateCoverImage = asyncHandler(async(req,res)=>{
  const newCoverImage = req.file?.path; //changes with my opinion
   
  if(!newCoverImage){
   throw new ApiError(400,"CoverImage is required");
  }

  const coverImage = await uploadOnCloudinary(newCoverImage)

  if(!coverImage){
   throw new ApiError(500,"CoverImage is not uploaded on server");
  }

   const user = await User.findByIdAndUpdate(req.user?._id,{
     $set:{
         coverImage: coverImage?.url
     }
   },{
     new: true
   }).select(
     "-password -refreshToken"
   )

   return res.status(200).json(new ApiResponse(201,user,"Succesfully updated CoverImage"))
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
  
  const {userId} = req.params;

  if (!userId) {
      throw new ApiError(400,"username is required")
  }

  const channel = await User.aggregate([
    {
      $match: { //used for filtering on certain condition to find account with given username
        _id: new mongoose.Types.ObjectId(userId) //condition
      }
    },
    {
      $lookup:{
        from: "subscribtions", //schema name in plural form 
        localField: "_id", //Users _id
        foreignField: "channel",
        as: "Subscriber" //Subscriber: [{fullName,...},{}] 
      }
    },
    {
      $lookup:{
        from: "subscribtions",
        localField:"_id",
        foreignField: "subscriber", //subscribed to another channel
        as: "Subscribed"//SubscribedTo: [{fullName,...},{}] 
      }
    },
    {
      $addFields:{
        subscribeCount: {
          $size: "$Subscriber"
        },
        subscribedToCount:{
          $size: "$Subscribed"
        },
        isSubscribed:{
          $cond:{
            if: {$in: [req.user?._id,"$Subscriber.subscriber"]},
            then: true,                                       
            else: false
          }
        }
      }
    },
    {
      $project:{
        fullName: 1,
        username: 1,
        subscribeCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
        email: 1,
        avatar: 1,
        coverImage: 1
      }
    }
  ])

   

  /* 
  console of channel:-

  channel = [
    {  _id: 1
      fullName: 1,
        username: 1,
        subscribeCount: 1,
        subscribedToCount: 1,
        isSubscribed,
        email: 1,
        avatar: 1,
        coverImage: 1,
  subscribeCount: 1,
  isSubscribed: 1,
  Subscriber: [{ _id: 1,fullName: 1,username: 1, email: 1,avatar: 1,coverImage: 1}...]
  Subscribed as channel: [{ _id: 1,fullName: 1,username: 1, email: 1,avatar: 1,coverImage: 1}...]

  }
  
  ]
  
  */


  if(!channel?.length){
    throw new ApiError(400,"channel does not existed")
  }

  return res.status(200).json(new ApiResponse(200,channel[0],"user channel fetched successfully"))

})

const getWatchedHistory = asyncHandler(async(req,res)=>{
     
   const user = await User.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    {
      $lookup:{
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",  //[{id,thumbnail,...,owner:[]}]
        pipeline:[
          {
            $lookup:{
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline:[
                {
                  $project:{
                    fullName: 1,
                    email: 1,
                    coverImage: 1,
                    subscribeCount: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },{
            $addFields:{
              owner:{
                $first: "$owner" //add field owner in which adds owner array converted into object
              }
            }
          }
        ]

      }      
    }
     


   ])

   return res.status(200).json(new ApiResponse(200,user[0]?.watchHistory,"watched fetched successfully"))

})

const getUserById = asyncHandler(async(req,res)=>{
   const {userId} = req.params;

   if (!userId) {
     throw new ApiError(404,"UserId is required")
   }

   try {
          const user = await User.findById(userId).select("-password -refreshToken")

          if (!user) {
             return res.status(404).json(new ApiResponse(404,"","Not found user || server failed"))
          }

          return res.status(200).json(new ApiResponse(200,user,"successfully fetched user"))
   } catch (error) {
    throw new ApiError(500,"server failed")
   }
})


export {userHandler
  ,getCurrentUser,
   loginHandler,
   logOut,
   generateRefreshAccessToken,
   changeCurrentPassword,
   updateAccount,
   updateAvatar,
   updateCoverImage,
   getUserChannelProfile,
   getWatchedHistory,
   getUserById
  
  };