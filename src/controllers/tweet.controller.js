import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
   const {content} = req.body;
   const user = req.user?._id;

   if (!content) {
      throw new ApiError(400,"Content is required")   
   }

   const tweet = await Tweet.create({
    owner: user,
    content
   })

   if (!tweet) {
    throw new ApiError(500,"server failed to save tweet")
   }

   return res.status(200).json(new ApiResponse(200,tweet,"successfully saved tweet"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

   const {userId} = req.params;

   if (!userId) {
      throw new ApiError(400,"userId is required")   
   }

   const tweet = await Tweet.find({owner: userId});
   
   if (!tweet) {
      return res.status(200).json(new ApiResponse(200,tweet,"No others tweet or server failed"))
   }

   let tweets = [];

   for (let i = 0; i < tweet?.length; i++) {
      const allTweet = await Tweet.findById(tweet[i]._id);
      if (allTweet) {
        tweets.push({
            allTweet
        })
      }else{
        throw new ApiError(500,"server failed to fetch all tweets")
      }
    
   }

   return res.status(200).json(new ApiResponse(200,tweets, "successfully fetched all tweets"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
     const {tweetId} = req.params;
     const {content} = req.body;
     const user = req.user?._id;

     if (!(tweetId && content)) {
        throw new ApiError(400,"tweetId and content is required")
     }

     const tweet = await Tweet.findOneAndUpdate({owner: user, _id: tweetId},{
        $set:{
            content
        }
     },{
        new: true
     })

     if (!tweet) {
        return res.status(404).json(new ApiResponse(500,{},"Unauthorized person try to update the tweet"))
     }

     return res.status(200).json(new ApiResponse(200,tweet,"successfully updated tweet"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;

    if (!tweetId) {
        throw new ApiError(400,"tweetId is required")
    }

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deleteTweet) {
        throw new ApiError(500,"server failed to delete tweet")
    }

    return res.status(200).json(new ApiResponse(200,{},"successfully delete tweet"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}