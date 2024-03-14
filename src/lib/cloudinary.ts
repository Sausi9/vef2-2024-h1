import util from "util";

import { v2 as cloudinary } from "cloudinary";
import { Environment } from "./environment.js";

export function makeCloudinaryConfig(env : Environment){
    if(cloudinary.config().api_key) { return; }
    const {
        cloudinaryName,
        apiKey,
        apiSecret
    } = env;
    cloudinary.config({
        cloud_name: cloudinaryName,
        api_key: apiKey,
        api_secret: apiSecret
    });
    console.log(cloudinary.config());
}

const uploadAsync = util.promisify(cloudinary.uploader.upload);

export async function uploadImage(filepath : string) {
  return uploadAsync(filepath);
}
