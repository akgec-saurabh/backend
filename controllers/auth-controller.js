const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  //Find if user already Existed
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError("Some error occured while registering", 500));
  }
  if (existingUser) {
    return next(new HttpError("User already Exist", 422));
  }

  let hashPassword;
  try {
    hashPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError("Could not create User, please try again", 500));
  }

  const newUser = new User({
    name: { firstName, lastName },
    email,
    password: hashPassword,
  });

  try {
    await newUser.save();
  } catch (error) {
    return next(
      new HttpError("Some error occured while saving User data", 500)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.SUPER_SECRET_JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Could not Register, please try again"));
  }

  return res.status(201).json({
    message: "User Created!",
    user: { name: { firstName, lastName }, email, token },
  });
};

/**
 * Login
 */

const login = async (req, res, next) => {
  const { email, password } = req.body;

  //Find if user already Existed
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError("Some error occured while finding User", 500));
  }

  if (!existingUser) {
    return next(
      new HttpError("Could not Log you in, please check your credentials", 500)
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(
      new HttpError("Could not Log you in, please check your credentials", 500)
    );
  }

  if (!isValidPassword) {
    return next(new HttpError("Invalid Credentials, please try again"));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.SUPER_SECRET_JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Could not Register, please try again"));
  }

  res.setHeader(
    "Set-Cookie",
    "myCookie=cookieValue;    domain=app.localhost; Path=/; HttpOnly=false; SameSite=None"
  );

  res.status(200).json({
    message: "Logged in Succesfully!",
    user: {
      email: existingUser.email,
      name: {
        firstName: existingUser.name.firstName,
        lastName: existingUser.name.lastName,
      },
      token,
    },
  });
};

exports.register = register;
exports.login = login;
