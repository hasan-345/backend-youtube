import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req,_,next)=>{
      
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
         //req.header("Authorization")?.replace("Bearer ","")
         //it is used to access accesstoken whenever your api is called through app. 
         //we can't access cookies in app bec cookies are not available in app
         //so that frontend developer sends access token through header 
         //Bearer <token>
       
         if(!token){
            throw new ApiError(401,"Unauthorized request");
         }
         
       const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
      )
    
      if(!user){
       throw new ApiError(401,"Invalid Access Token")
      }
       
      req.user = user
      next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})