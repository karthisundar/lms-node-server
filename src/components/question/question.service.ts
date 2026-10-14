import * as dal from "../../db/dal/question";
import { verifyJWT } from "../auth/jwt.utils";

export const createOrUpdateQuestion = async (
  params: any,
  token?: string,
): Promise<any> => {
  const tokenPayload = token ? await verifyJWT(token)?.payload : undefined;
  const createOrUpdateQuestion = await dal.createOrUpdateQuestion(
    params,
    tokenPayload,
  );
  return createOrUpdateQuestion;
};

export const getAllQuestions = async (
  params: any,
  token?: string,
): Promise<any> => {
  const tokenPayload = token ? await verifyJWT(token)?.payload : undefined;
  const getAllQuestions = await dal.getAllQuestions(params, tokenPayload);
  return getAllQuestions;
};

export const getQuestionByRefId = async (
  params: any,
  token?: string,
): Promise<any> => {
  const tokenPayload = token ? await verifyJWT(token)?.payload : undefined;
  const getQuestionByRefId = await dal.getQuestionByRefId(params, tokenPayload);
  return getQuestionByRefId;
};

export const deleteQuestion = async (
  params: any,
  token?: string,
): Promise<any> => {
  const tokenPayload = token ? await verifyJWT(token)?.payload : undefined;
  const deleteQuestion = await dal.deleteQuestion(params, tokenPayload);
  return deleteQuestion;
};

export const createQuestionAnswer = async (
  params: any,
  token?: string,
): Promise<any> => {
  const tokenPayload = token ? await verifyJWT(token)?.payload : undefined;
  const createQuestionAnswer = await dal.createQuestionAnswer(
    params,
    tokenPayload,
  );
  return createQuestionAnswer;
};

export const updateQuestionAnswer = async (
  params: any,
  token?: string,
): Promise<any> => {
  const tokenPayload = token ? await verifyJWT(token)?.payload : undefined;
  const updateQuestionAnswer = await dal.updateQuestionAnswer(
    params,
    tokenPayload,
  );
  return updateQuestionAnswer;
};

export const deleteQuestionAnswer = async (
  params: any,
  token?: string,
): Promise<any> => {
  const tokenPayload = token ? await verifyJWT(token)?.payload : undefined;
  const deleteQuestionAnswer = await dal.deleteQuestionAnswer(
    params,
    tokenPayload,
  );
  return deleteQuestionAnswer;
};
