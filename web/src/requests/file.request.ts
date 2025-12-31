import { AxiosPromise } from "axios";
import axios from "./axios.config";
import { operations, components } from "../types/api-types";

type ReadFileResponse = components["schemas"]["FileResponseDto"];
type ReadFileRequest = operations["FileController_readFile"]["requestBody"]["content"]["multipart/form-data"];

type SearchFileRequest = operations["FileController_searchFile"]["requestBody"]["content"]["application/json"];

type ListFileRequest = operations["FileController_list"]["parameters"]["query"];
type ListFileResponse = operations["FileController_list"]["responses"]["200"]["content"]["application/json"];

type RemoveFileRequest = operations["FileController_deleteFile"]["parameters"]["path"];
type RemoveFileResponse = operations["FileController_deleteFile"]["responses"]["200"];

type GetFileRequest = operations["FileController_get"]["parameters"]["path"];
type GetFileResponse = operations["FileController_get"]["responses"]["200"]["content"]["application/json"];

type GetLastestMessagesResponse = components["schemas"]["GetLastestMessagesResponseDto"][];
type GetLastestMessagesRequest = operations["FileController_getLastestMessages"]["parameters"]["path"];

const processStreamLine = (line: string, onChunk: (text: string) => void, onDone: () => void): boolean => {
    const trimmed = line.trim();

    if (!trimmed.startsWith("data:")) {
        return false;
    }

    const payloadRaw = trimmed.slice(5).trim();

    if (!payloadRaw) {
        return false;
    }

    try {
        const obj = JSON.parse(payloadRaw);

        if (obj.type === "chunk" && obj.content) {
            onChunk(obj.content);
        } else if (obj.type === "done") {
            onDone();
            return true;
        }
    } catch {}

    return false;
};

const processStreamChunk = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    decoder: TextDecoder,
    buffer: string,
    onChunk: (text: string) => void,
    onDone: () => void
): Promise<{ buffer: string; done: boolean }> => {
    const { value, done } = await reader.read();

    if (done) {
        return { buffer, done: true };
    }

    let newBuffer = buffer + decoder.decode(value, { stream: true });
    const lines = newBuffer.split(/\n\n/);
    newBuffer = lines.pop() || "";

    for (const line of lines) {
        if (processStreamLine(line, onChunk, onDone)) {
            return { buffer: newBuffer, done: true };
        }
    }

    return { buffer: newBuffer, done: false };
};

export const searchFileStream = async (
    data: SearchFileRequest,
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (error: unknown) => void,
    onStart: () => void
): Promise<void> => {
    try {
        onStart();

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/file/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        if (!response.body) {
            throw new Error("Stream indisponível");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
            const { buffer: newBuffer, done } = await processStreamChunk(reader, decoder, buffer, onChunk, onDone);

            buffer = newBuffer;

            if (done) {
                return;
            }
        }
    } catch (error) {
        onError(error);
    }
};

export const readFile = async (data: ReadFileRequest): AxiosPromise<ReadFileResponse> => {
    return axios.post("/file/read", data);
};

export const list = async (data: ListFileRequest): AxiosPromise<ListFileResponse> => {
    return axios.get("/file/list", { params: data });
};

export const remove = async (id: RemoveFileRequest["id"]): AxiosPromise<RemoveFileResponse> => {
    return axios.delete(`/file/${id}`);
};

export const get = async (id: GetFileRequest["id"]): AxiosPromise<GetFileResponse> => {
    return axios.get(`/file/${id}`);
};

export const getLastestMessages = async (id: GetLastestMessagesRequest["id"]): AxiosPromise<GetLastestMessagesResponse> => {
    return axios.get(`/file/${id}/message/lastest`);
};
