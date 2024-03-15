import util from "util";

import { v2 as cloudinary } from "cloudinary";
import { Environment } from "./environment.js";

export function makeCloudinaryConfig(env: Environment) {
  if (cloudinary.config().api_key) {
    return;
  }
  const { cloudinaryName, apiKey, apiSecret } = env;
  cloudinary.config({
    cloud_name: cloudinaryName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log(cloudinary.config());
}

const uploadAsync = util.promisify(cloudinary.uploader.upload);
const deleteAsync = util.promisify(cloudinary.uploader.destroy);

export async function uploadImage(filepath: string) : Promise<string> {
  let image: string;
  try {
    const uploadRes = await uploadAsync(filepath);
    if (!uploadRes || !uploadRes.secure_url) {
      throw new Error("no secure_url from cloudinary upload");
    }
    image = uploadRes.secure_url;
  } catch (e) {
    console.error("Unable to upload file to cloudinary", e);
    image = '';
  }
  return image;
}

export async function deleteImage(imgUrl : string){
    const imgId = imgUrl.slice(imgUrl.lastIndexOf('/')+1,imgUrl.lastIndexOf('.'));
    try{
        const destroyRes = await deleteAsync(imgId);
        console.info(destroyRes);
    } catch (e) {
        console.error('Unable to destroy cloudinary image', e);
    }
}
