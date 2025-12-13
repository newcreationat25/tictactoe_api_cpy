import { reponse, error } from "../model/response";

export const sendSuccess = (res: unknown, p0: boolean, message: string, data: any = null) => {
  const r = new reponse();
  r.status = true;
  r.message = message;
  r.data = JSON.stringify(data);
  r.error = new error();
  return r;
};

export const sendError = (message: string, code: number, details: string) => {
  const r = new reponse();
  const err = new error();

  err.code = code;
  err.details = details;

  r.status = false;
  r.message = message;
  r.data = null;
  r.error = err;

  return r;
};
