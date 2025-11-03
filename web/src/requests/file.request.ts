import { AxiosPromise } from "axios";
import axios from "./axios.config";
import { operations } from "../types/api-types";

type UploadFileResponse = operations["FileController_uploadFile"]["responses"]["200"];
type UploadFileRequest = operations["FileController_uploadFile"]["requestBody"]["content"]["multipart/form-data"];

export const uploadFile = async (data: UploadFileRequest): AxiosPromise<UploadFileResponse> => {
    return axios.post("/file/upload", data);
};
