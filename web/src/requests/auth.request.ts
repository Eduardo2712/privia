import { AxiosPromise } from "axios";
import axios from "./axios.config";
import { operations } from "../types/api-types";

type LoginRequest = operations["AuthController_login"]["requestBody"]["content"]["application/json"];
type LoginResponse = operations["AuthController_login"]["responses"]["200"];
type LogoutResponse = operations["AuthController_logout"]["responses"]["200"];

export const login = async (data: LoginRequest): AxiosPromise<LoginResponse> => {
    return axios.post("/auth/login", data);
};

export const logout = async (): AxiosPromise<LogoutResponse> => {
    return axios.post("/auth/logout");
};
