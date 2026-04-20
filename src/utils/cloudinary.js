import {v2 as cloudinary} from 'cloudinary';

import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.API_CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.API_CLOUDINARY_API_KEY, 
    api_secret: process.env.API_CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        console.log("localFilePath:", localFilePath);

        const response =await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });
        // file uploaded successfully

        // console.log("file uploaded:",response.url);
        console.log("response:", response.secure_url);
        
        fs.unlinkSync(localFilePath); // remove the local file after uploading to cloudinary
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the local file after uploading to cloudinary
        console.log("Error while uploading file to cloudinary", error);
        return null;
    }
}

export {uploadOnCloudinary};