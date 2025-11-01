import { AxiosPromise } from "axios";
import axios from "./axios.config";
import { operations } from "../types/api-types";

export const uploadFile = async (file: File): AxiosPromise<unknown> => {
    return axios.post("/file/upload", file);
};
