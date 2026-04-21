import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Error while generating tokens");
    }
}

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

const loginUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // username and email both should be allowed for login, so check if user is trying to login with email or username.
    //// validate user details - not empty, email should be in correct format, etc
   // // check if user login with email or username, find user in database.
    // find user in database by email or username.
    // if user not found, send error response.
    // if user found, compare password with hashed password in database.
    // if password does not match, send error response.
    // if password matches, generate access token and refresh token.
    // save refresh token in database for the user.
    // send success response with access token and user details (except password and refresh token).

    const {email, username, password} = req.body;

    console.log("email:", email);
    console.log("username:", username); 

    if(!username && !email) {
        throw new ApiError(400, "Email or username is required for login");
    }

    const user =await User.findOne({
        $or: [ { email },{ username } ]
  });

  if(!user) {
    throw new ApiError(404, "User not found with this email or username");
  }

  const isPasswordMatched = await user.comparePassword(password);

  if(!isPasswordMatched) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser  = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
        200,
        {
            user: loggedInUser,
            accessToken, 
            refreshToken
        },
        "User logged in successfully"
    )
  )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        await User.findOneAndUpdate(
            { _id: userId },
            { refreshToken },
            { returnDocument: "after" }
        )
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            null,
            "User logged out successfully"
        )
    )

});


export { 
    registerUser,
    loginUser,
    logoutUser
 }