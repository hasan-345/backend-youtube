import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Subscribtion } from "../models/subscription.model.js";
import {User} from "../models/user.model.js"

const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;

    const userId = req.user._id; // Assuming you have user authentication in place

    if (!channelId) {
      throw new ApiError(400,"ChannelId is required");
    }


    if(channelId == userId){
        return res.status(404).json(new ApiResponse(404,{},"You can't subscribe your own channel"))
        }

    const existedSubscriber = await Subscribtion.findOne({
        channel: channelId,
        subscriber: userId
    })

    if (existedSubscriber) {
      const unsubscribed = await Subscribtion.findOneAndDelete({channel: channelId,
        subscriber: userId})
        return res.status(200).json(new ApiResponse(200,unsubscribed,"UnSubscribed Successfully"))
    }

    const subscribed = await Subscribtion.create({
        channel: channelId,
        subscriber: userId
    })

    if(!subscribed){
        throw new ApiError(500,"server error Unsuccessfully subscribed");
    }

    return res.status(200).json(new ApiResponse(200,subscribed,"SuccessFully subscribed"))

})
//return all subscriber list 
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    if(!channelId){
        throw new ApiError(400,"channelId is required")
    }

    const subscriber = await Subscribtion.find({channel: channelId});
   
     if (!subscriber) {
        throw new ApiError(500,"Subscriber fetched error")
     }

     let subscribers = [];

     for(let i = 0; i < subscriber.length; i++){
        const subscribed = await User.findById(subscriber[i].subscriber);
        if(subscribed){
            subscribers.push({
          _id: subscribed._id,
          fullName: subscribed.fullName,
          username: subscribed.username,
          email: subscribed.email,
          avatar: subscribed.avatar,
          coverImage: subscribed.coverImage
                
            })
        }else{
            throw new ApiError(500,"Subscriber fetched issue")
        }
        
     }

    /*subscriber = [
   {
     channel: {id,name...},
     subscriber: {id,name...} 
   } 
]*/

return res.status(200).json(new ApiResponse(200,subscribers,"successfully fetched"))

})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400,"SubscribedId is required")
    }

    const channel = await Subscribtion.find({subscriber: subscriberId})

    if(!channel){
        throw new ApiError(500,"Subscribed fetched issue")
    }
    let channels = [];

    for (let i = 0; i < channel?.length; i++) {
        const oneChannel = await User.findById(channel[i].channel)
        if (oneChannel) {
            channels.push({
                _id: oneChannel._id,
                fullName: oneChannel.fullName,
                username: oneChannel.username,
                email: oneChannel.email,
                avatar: oneChannel.avatar,
                coverImage: oneChannel.coverImage
            })
        }else{
            throw new ApiError(500,"Subscribed fetched issue")
        }
    }

    return res.status(200).json(new ApiResponse(200,channels,"successfully fetched channels"))
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}