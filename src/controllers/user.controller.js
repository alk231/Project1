import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { jwt } from "../middlewares/auth.middleware.js";


const generateAccessAndRefreshToken=async(userId)=>{
  try{
      const user=await User.findById(userId)
      const accessToken=user.generateAccessToken()
      const refreshToken=user.generateRefreshToken()

      user.refreshToken=refreshToken
      await user.save({validateBeforeSave:false})

      return {accessToken,refreshToken}
  }
  catch(error){
    throw new ApiError(500,"Something went wrong while generating refresh and access token")
  }
}

export const registerUser=asyncHandler(async (req,res)=>{
  // get user details from frontend 
  console.log("🚀 Register User Function Called!");
  console.log("Request Headers:", req.headers);
  console.log("Request Body:", req.body);
  // validation - not empty
  // check if user already exists: username,email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res
  console.log("hi")
  const {fullName,email,username,password}=req.body
  console.log("email",email)

  if([fullName,email,username,password].some((field)=>field?.trim()===""))
  {
    throw new ApiError(400,"All fields are required")
  }
  const existedUser=await User.findOne({
    $or:[{username},{email}]
  })
  if(existedUser)
  {
    throw new ApiError(409,"User with email or username already exists")
  }

  const avatarLocalPath=req.files?.avatar[0]?.path;
  // const coverImageLocalPath=req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)
  {
    coverImageLocalPath=req.files.coverImage[0].path;
  }
  if(!avatarLocalPath)
  {
    throw new ApiError(400,"Avatar file is required")
  }
  const avatar=await uploadOnCloudinary(avatarLocalPath)
  const coverImage=coverImageLocalPath? await uploadOnCloudinary(coverImageLocalPath):null
  
  if(!avatar)
  {
    throw new ApiError(400,"Avatar file is required")
  }

  const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
    email,
    password,
    username:username.toLowerCase()
  })

  const createdUser=await User.findById(user._id).select("-password -refreshToken")

  if(!createdUser)
  {
    throw new ApiError(500,"something went wrong while registering the user")
  }

  return res.status(200).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  )

})

export const loginUser=asyncHandler(async(req,res)=>{
  //req.body->data
  //check whether the details are correct
  //generate the access token and refresh token on sucessful login

  const {email,username,password}=req.body

  if(!(username||email))   //it will throw error if either username or email is not inputted.its on us whether we want to use one or both
  {
    throw new ApiError(400,"username or email is required");
  }

  const user=await User.findOne({
    $or:[{username},{email}]  //it will check for either username or email
  })

  if(!user)
  {
    throw new ApiError(404,"User does not exist")
  }

  const isPasswordValid=await user.ispasswordCorrect(password)

  if(!isPasswordValid)
  {
    throw new ApiError(401,"Password is invalid")
  }

  const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
  
  //The data which will be sending to the user
  const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

  const options={
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .cookie("accessToken",acessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(200,{
      user:loggedInUser,accessToken,refreshToken
    },
  "User logged in Successfully")
  )
})

export const logOutUser=asyncHandler(async(req,res)=>{
       User.findByIdAndUpdate(
        req.user._id,{
          $set:{
            refreshToken:undefined
          }
        },{
          new:true
        }
       )

       const options={
        httpOnly:true,
        secure:true
       }

       return res
       .status(200)
       .clearCookie("accessToken",options)
       .clearCookie("refreshToken",options)
       .json(new ApiResponse(200,{},"User logged out"))
  })

export const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken

  if(incomingRefreshToken)
  {
    throw new ApiError(401,"unauthorized access")
  }
  
  try{
      const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

  const user=await User.findById(decodedToken?._id)

  if(!user)
  {
    throw new ApiError(401,"Refresh token is expired or used")
  }

  if(incomingRefreshToken!==user?.refreshToken)
  {
    throw new ApiError(401,"Refresh token is expired or used")
  }

  const options={
    httpOnly:true,
    secure:true
  }

  const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newRefreshToken,options)
  .json(
    new ApiResponse(
      200,{accessToken,refreshToken:newRefreshToken},
      "Access token refreshed"
    )
  )
  }

  catch(error){
        throw new ApiError(401,error?.message || "Invalid refresh token")
  }
  

})