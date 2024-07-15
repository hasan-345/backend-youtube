import { v2 as cloudinary } from 'cloudinary';
import fs from "fs/promises" //file system
import { ApiError } from './ApiError.js';
cloudinary.config({ 
    cloud_name: "diafwltkj",  //write as it not use env variable
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET 
});

const deleteOnCloudinary = async (localPathFile)=>{


    try {
    if(!localPathFile) return null;

     const response =  await cloudinary.uploader.destroy(localPathFile)
        return response;
    } catch (error) {
        throw new ApiError(500,"Failed to delete photo")
    }
    
}

export {deleteOnCloudinary}