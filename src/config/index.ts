import dotenv from "dotenv";
import e from "express";
import path from "path";
 
dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  cloudinary: {
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
  },
  open_router_api_key: process.env.OPEN_ROUTER_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
  jwt: {

    jwt_secret: process.env.ACCESS_TOKEN_SECRET,
    expires_in: process.env.EXPIRATION_TIME,
     refresh_token_secret: process.env.RESET_PASSWORD_TOKEN,
     refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
    reset_pass_secret: process.env.RESET_PASSWORD_SECRET,
    reset_pass_token_expires_in: process.env.RESET_PASSWORD_EXPIRATION_TIME,
  },
  salt_round: process.env.BCRYPT_SALT_ROUND,
  reset_pass_link_client_url: process.env.RESET_PASS_LINK_CLIENT_URL,
 
  emailSender: {
    email: process.env.EMAIL_SENDER_EMAIL,
    app_pass: process.env.EMAIL_SENDER_APP_PASSWORD,
  },
};
