import { AxiosPromise } from "axios";
import axios from "./axios.config";
import { operations } from "../types/api-types";

type UploadFileResponse = operations["FileController_uploadFile"]["responses"]["200"];
type UploadFileRequest = operations["FileController_uploadFile"]["requestBody"]["content"]["multipart/form-data"];

type SearchFileResponse = operations["FileController_searchFile"]["responses"]["200"];
type SearchFileRequest = operations["FileController_searchFile"]["requestBody"]["content"]["application/json"];

export const searchFile = async (data: SearchFileRequest): AxiosPromise<SearchFileResponse> => {
    return axios.post("/file/search", data);
};

export const uploadFile = async (data: UploadFileRequest): AxiosPromise<UploadFileResponse> => {
    return axios.post("/file/upload", data);
};
