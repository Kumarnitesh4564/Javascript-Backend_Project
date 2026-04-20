import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validate user details - not empty, email should be in correct format, etc
    // check if user already exists - by email, username.
    // check for images, avtar
    // upload them to cloudinary, avatar.
    // create user object - create entry in database.
    // remove password and refresh token from user object before sending response.
    // check if user created successfully, if not send error response.
    // send success response with user details.


    const { fullName, email, password, username} = req.body;
    console.log("email:", email);

    // if(!fullName || !email || !password || !username) {
    //     return res.status(400).json({
    //         success: false,
    //         message: "All fields are required"
    //     })
    // }

    

    if( 
        [fullName, email, password, username].some(field => (field.trim() === ""))
    ) {
        throw new  ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    });

    if(existedUser) {
        throw new ApiError(400, "User already exists with this email or username");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }       

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar =await uploadOnCloudinary(avatarLocalPath);

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);



    if(!avatar) {
        throw new ApiError(500, "Error while uploading avatar");
    }

    const user = await User.create({
        fullName,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        username
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500, "Error while creating user");
    }

    console.log(createdUser);
    

    return res.status(201).json(
        new ApiResponse(
            200,
            "User registered successfully",
            createdUser
        )
    )
    
});


export { registerUser }