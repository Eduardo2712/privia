import { AxiosPromise } from "axios";
import axios from "./axios.config";
import { operations } from "../types/api-types";

type ReadFileResponse = operations["FileController_readFile"]["responses"]["200"];
type ReadFileRequest = operations["FileController_readFile"]["requestBody"]["content"]["multipart/form-data"];

type SearchFileResponse = operations["FileController_searchFile"]["responses"]["200"]["content"]["application/json"];
type SearchFileRequest = operations["FileController_searchFile"]["requestBody"]["content"]["application/json"];

export const searchFile = async (data: SearchFileRequest): AxiosPromise<SearchFileResponse> => {
    return axios.post("/file/search", data);
};

export const readFile = async (data: ReadFileRequest): AxiosPromise<ReadFileResponse> => {
    return axios.post("/file/read", data);
};
