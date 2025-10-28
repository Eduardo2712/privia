import { AxiosPromise } from "axios";
import axios from "./axios.config";
import { operations } from "../types/api-types";

type ListMessageRequest = operations["MessageController_list"]["parameters"]["query"];
type ListMessageResponse = operations["MessageController_list"]["responses"]["200"]["content"]["application/json"];

export const list = async (data: ListMessageRequest): AxiosPromise<ListMessageResponse> => {
    return axios.get("/message/list", { params: data });
};

export const read = async (id: number): AxiosPromise<void> => {
    return axios.get(`/message/${id}/read`);
};
