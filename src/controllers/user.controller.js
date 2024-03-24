import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { UploadToCloudinary } from "../utils/Cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

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
    coverImageLocalPath = req.files.coverImage?.path;
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
    "-passWord -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Some problew occur while registering");
  }

  return res
    .status(202)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
