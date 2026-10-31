import * as dal from "../../db/dal/question";
import { verifyJWT } from "../auth/jwt.utils";
import { spawn } from "child_process";

const extractTokenPayload = async (token?: string) => {
  if (!token) return undefined;
  const clean = token.startsWith("Bearer ") ? token.slice(7) : token;
  const decoded = await verifyJWT(clean);
  return decoded?.payload;
};

export const createOrUpdateQuestion = async (
  params: any,
  token?: string,
): Promise<any> => {
  const tokenPayload = await extractTokenPayload(token);
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
  const tokenPayload = await extractTokenPayload(token);
  const getAllQuestions = await dal.getAllQuestions(params, tokenPayload);
  return getAllQuestions;
};

export const getQuestionByRefId = async (
  params: any,
  token?: string,
): Promise<any> => {
  const tokenPayload = await extractTokenPayload(token);
  const getQuestionByRefId = await dal.getQuestionByRefId(params, tokenPayload);
  return getQuestionByRefId;
};

export const deleteQuestion = async (
  params: any,
  token?: string,
): Promise<any> => {
  const tokenPayload = await extractTokenPayload(token);
  const deleteQuestion = await dal.deleteQuestion(params, tokenPayload);
  return deleteQuestion;
};

export const createQuestionAnswer = async (
  params: any,
  token?: string,
): Promise<any> => {
  const tokenPayload = await extractTokenPayload(token);
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
  const tokenPayload = await extractTokenPayload(token);
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
  const tokenPayload = await extractTokenPayload(token);
  const deleteQuestionAnswer = await dal.deleteQuestionAnswer(
    params,
    tokenPayload,
  );
  return deleteQuestionAnswer;
};

export const checkPythonSyntax = async (
  code?: string,
): Promise<{
  valid: boolean;
  message: string;
  line?: number;
  column?: number;
  text?: string;
}> => {
  if (code === undefined || code === null || !code.trim()) {
    return {
      valid: false,
      message: "Code is empty. Please enter Python code to check.",
    };
  }

  return new Promise((resolve) => {
    const pyScript = [
      "import ast, sys, json",
      "try:",
      "    source = sys.stdin.read()",
      "    ast.parse(source)",
      '    print(json.dumps({"valid": True, "message": "Python syntax is valid! No syntax errors found."}))',
      "except SyntaxError as e:",
      '    print(json.dumps({"valid": False, "message": e.msg, "line": e.lineno, "column": e.offset, "text": e.text.strip() if e.text else ""}))',
      "except Exception as e:",
      '    print(json.dumps({"valid": False, "message": str(e)}))',
    ].join("\n");

    const py = spawn("python", ["-c", pyScript]);
    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (chunk) => {
      stdout += chunk;
    });

    py.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    py.on("error", (err) => {
      resolve({
        valid: false,
        message: "Failed to run Python syntax checker: " + err.message,
      });
    });

    py.on("close", () => {
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch {
        resolve({
          valid: false,
          message: stderr ? stderr.trim() : "Syntax validation encountered an unexpected error.",
        });
      }
    });

    py.stdin.write(code);
    py.stdin.end();
  });
};
