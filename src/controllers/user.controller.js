import AsyncHandler from "../utils/AsyncHandler.js";

const registerUser = AsyncHandler(async (req, res) => {
  //get user details from front-end ---postman
  //validation ----not empty
  //check if user already exit ---username,email
  //check for image , check for avtar
  //upload them to cloudinary
  //create user object -- create entry in db
  //remove password and refresh token from response
  //check for user creation
  //return response
});

export { registerUser };
