"use client";

import { useRef, useState } from "react";
import { useRequest } from "../hooks/use-request.hook";
import { uploadFile } from "../requests/file.request";
import toast from "react-hot-toast";
import { AxiosRequestConfig } from "axios";

export default function HomePage() {
    const [file, setFile] = useState<File | null>(null);

    const { execute } = useRequest({
        request: (config?: AxiosRequestConfig) => uploadFile(config?.data),
        onSuccess: () => toast.success("Arquivo enviado com sucesso!"),
        onError: () => toast.error("Erro ao enviar arquivo."),
    });

    const refButton = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File | null) => {
        if (!file) {
            return;
        }

        setFile(file);

        const formData = new FormData();

        formData.append("file", file);

        await execute({ data: formData, headers: { "Content-Type": "multipart/form-data" } });
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center text-black">
            <input
                type="file"
                hidden
                className="file-input file-input-bordered w-full max-w-xs"
                onChange={(e) => handleUpload(e.target.files ? e.target.files[0] : null)}
                ref={refButton}
                accept=".pdf,.doc,.docx,.txt"
            />

            <p className="text-black mt-2 mb-2 mr-2">{file?.name}</p>

            <button className="bg-amber-500 text-black rounded-2xl px-4 py-2 cursor-pointer" onClick={() => refButton.current?.click()}>
                Upload de arquivo
            </button>
        </div>
    );
}
