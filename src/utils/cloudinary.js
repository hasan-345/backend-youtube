import { v2 as cloudinary } from 'cloudinary';
import fs from "fs/promises" //file system
cloudinary.config({ 
    cloud_name: "diafwltkj",  //write as it not use env variable
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET 
});

const uploadOnCloudinary = async (localPathFile)=>{


    try {
            if(!localPathFile) return null;

     const response =  await cloudinary.uploader.upload(localPathFile,{
            resource_type:'auto'
        })
        return response;
    } catch (error) {
        fs.unlinkSync(localPathFile)
        return null;
    }
    
}

export {uploadOnCloudinary}