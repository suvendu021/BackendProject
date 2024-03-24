# configure our backend project

- nodemon library for avoid connect and disconnecting server multiple times
- mongoDB connect
- config cors , cookie parser, different format of request(json, files , encoded url)
- create asyncHandlers for async operations
- create utils file to handle Api response and error
- using express listen request at port

# create user model and video model

- Design Model for User and Video
- mongoose aggregate paginate for write aggregate pipiline
  - plugin into our Schema
- bcrypt package for HASH(encrypt and compare) our password
- jwt package install
- use "pre" hooks or middleware function by mongoose for encryption of password just before save data to DB
- create custom method for comparing password with encrypted password
- create custom methods for generating refresh and access token by jwt.sign method

# create middleware and router

- multer package for upload file
- cloudinary server for handling files
- controller for registering users
- http methods, different status code
- postman for testing

# write controller for registering user

- write algorithm how to resister user properly
- test it by using postman
