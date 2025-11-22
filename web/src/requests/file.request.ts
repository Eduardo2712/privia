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

export const searchFileStream = async (
    data: SearchFileRequest,
    onChunk: (text: string) => void,
    onReferences: (refs: Array<{ text: string; index: number }>) => void,
    onTimeInMs: (time: number) => void,
    onDone: () => void,
    onError: (error: unknown) => void
): Promise<void> => {
    try {
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
            const { value, done } = await reader.read();

            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split(/\n\n/);

            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmed = line.trim();

                if (!trimmed.startsWith("data:")) {
                    continue;
                }

                const payloadRaw = trimmed.slice(5).trim();

                if (!payloadRaw) {
                    continue;
                }

                try {
                    const obj = JSON.parse(payloadRaw);

                    if (obj.type === "chunk" && obj.content) {
                        onChunk(obj.content);
                    } else if (obj.type === "references" && obj.references) {
                        onReferences(obj.references);
                    } else if (obj.type === "timeInMs" && obj.timeInMs) {
                        onTimeInMs(obj.timeInMs);
                    } else if (obj.type === "done") {
                        return onDone();
                    }
                } catch {}
            }
        }

        onDone();
    } catch (error) {
        onError(error);
    }
};

export const readFile = async (data: ReadFileRequest): AxiosPromise<ReadFileResponse> => {
    return axios.post("/file/read", data);
};
