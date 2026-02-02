import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

const isCloudinaryConfigured =
  env.cloudinaryCloudName.length > 0 &&
  env.cloudinaryApiKey.length > 0 &&
  env.cloudinaryApiSecret.length > 0;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret
  });
}

export const uploadImageToCloudinary = async (input: { buffer: Buffer; filename: string; mimetype: string }) => {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured");
  }

  const dataUri = `data:${input.mimetype};base64,${input.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: env.cloudinaryFolder,
    resource_type: "image",
    public_id: `${Date.now()}-${input.filename.replace(/\s+/g, "-")}`
  });

  return result.secure_url;
};
