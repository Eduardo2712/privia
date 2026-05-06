import { AxiosPromise } from "axios";
import axios from "./axios.config";
import { operations } from "../types/api-types";

type CreateUserResponse = operations["UserController_create"]["responses"]["200"]["content"]["application/json"];
type CreateUserRequest = operations["UserController_create"]["requestBody"]["content"]["application/json"];

export const create = async (data: CreateUserRequest): AxiosPromise<CreateUserResponse> => {
    return axios.post("/user", data);
};
