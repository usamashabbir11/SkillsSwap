import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "skillsswap/profiles",
    resource_type: "image"
  }
});

const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "skillsswap/covers",
    resource_type: "image"
  }
});

const courseStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "skillsswap/courses",
    resource_type: "video",
    chunk_size: 6000000,
    transformation: [{ quality: "auto" }]
  }
});

export const uploadProfile = multer({ storage: profileStorage });
export const uploadCover = multer({ storage: coverStorage });
export const uploadCourse = multer({ storage: courseStorage, limits: { fileSize: 100 * 1024 * 1024 } });
