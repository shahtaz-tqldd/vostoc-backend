import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 6500,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  socketCorsOrigin: process.env.SOCKET_CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || "vostoc/doctors"
};
