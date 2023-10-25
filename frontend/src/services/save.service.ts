import axios from "axios";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_MATCHING_SERVICE_CORS ? "http://localhost:" + process.env.REACT_APP_MATCHING_SERVICE_CORS + "/api/run/" : "http://localhost:3002/api/run/";

export const runcode = (code : string, input : string, language : string, fileName : string) => {
  const header = authHeader();

  console.log(header);
  console.log("API for runcode:" + API_URL + "runcode");

  return axios.post(API_URL + "runcode", {
    code,
    input,
    language,
    fileName
  }, 
  { headers: header });
};
