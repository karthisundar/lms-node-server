import * as dal from "../../db/dal/videos";
import { verifyJWT } from "../auth/jwt.utils";

export const createVideo = async (params: any, token: string): Promise<any> => {
  const createVideo = await dal.createVideo(
    params,
    await verifyJWT(token)?.payload,
  );
  return createVideo;
};

export const getAllVideos = async (params: any): Promise<any> => {
  const getAllVideos = await dal.getAllVideos(params);
  return getAllVideos;
};

export const getVideo = async (params: any): Promise<any> => {
  const getVideo = await dal.getVideo(params);
  return getVideo;
};

export const deleteVideo = async (params: any, token: string): Promise<any> => {
  const deleteVideo = await dal.deleteVideo(
    params,
    await verifyJWT(token)?.payload,
  );
  return deleteVideo;
};
