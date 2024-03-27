import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { UploadToCloudinary } from "../utils/Cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      505,
      error?.message || "process failed during generate token"
    );
  }
};

const registerUser = AsyncHandler(async (req, res) => {
  // res.status(200).json({
  //   message: "req get at server",
  // });

  //get user details from front-end --- using postman
  //validation ----not empty
  //check if user already exit ---username,email
  //check for image , check for avtar
  //upload them to cloudinary
  //create user object -- create entry in db
  //remove password and refresh token from response
  //check for user creation
  //return response

  const { userName, fullName, email, password } = req.body;
  console.log("fullName :", fullName);

  if (
    [userName, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ email }, { userName }] });

  if (existedUser) {
    fs.unlinkSync(req.files?.avtar[0]?.path);
    throw new ApiError(409, "user aleready exist with this userName or email");
  }

  const avtarLocalPath = req.files?.avtar[0]?.path;

  // console.log(req.files);
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0]?.path;
  }

  if (!avtarLocalPath) {
    throw new ApiError(400, "avtar file is required");
  }

  const uploadedAvtar = await UploadToCloudinary(avtarLocalPath);

  const uploadedCoverImage = await UploadToCloudinary(coverImageLocalPath);

  if (!uploadedAvtar) {
    throw new ApiError(400, "avtar file is required");
  }

  const user = await User.create({
    fullName,
    avtar: uploadedAvtar.url,
    userName: userName.toLowerCase(),
    email,
    coverImage: uploadedCoverImage?.url || "",
    password,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Some problew occur while registering");
  }

  return res
    .status(202)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = AsyncHandler(async (req, res) => {
  //first check entered email is present in database or not basically authenticate
  //entered password is same as present in database
  //access and refresh token
  //send cookie

  const { userName, email, password } = req.body;

  if (!userName && !email) {
    throw new ApiError(400, "email or userName required");
  }

  const user = await User.findOne({ $or: [{ email }, { userName }] });

  if (!user) {
    throw new ApiError(404, "user is not existed");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "user credential is invalid");
  }

  const { refreshToken, accessToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        202,
        { loggedInUser: loggedInUser, accessToken, refreshToken },
        "user successfully loggedIn"
      )
    );
});

const logoutUser = AsyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },

    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "user loggedOut successfully"));
});

const refreshAccessToken = AsyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.accessToken || req.body;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unAuthorize request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_SECRET_TOKEN
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "invalid refreshToken");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw ApiError(401, "refreshToken is expire or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          202,
          {
            accessToken,
            newRefreshToken,
          },
          "accessToken is refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "error occur during decode Token"
    );
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
