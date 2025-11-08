"use client";

import { useRef, useState } from "react";
import { useRequest } from "../hooks/use-request.hook";
import { searchFile, uploadFile } from "../requests/file.request";
import toast from "react-hot-toast";
import { AxiosRequestConfig } from "axios";
import { LoaderCircle } from "lucide-react";

export default function HomePage() {
    const [file, setFile] = useState<File | null>(null);
    const [searchText, setSearchText] = useState<string>("");

    const { execute, loading } = useRequest({
        request: (config?: AxiosRequestConfig) => uploadFile(config?.data),
        onSuccess: () => toast.success("Arquivo enviado com sucesso!"),
        onError: () => toast.error("Erro ao enviar arquivo."),
        onFinally: () => setFile(null),
    });

    const { execute: searchExecute, loading: searchLoading } = useRequest({
        request: () => searchFile({ search: searchText }),
        onSuccess: () => toast.success("Busca realizada com sucesso!"),
        onError: () => toast.error("Erro ao realizar busca."),
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

    const handleSearch = async () => {
        if (!searchText) {
            return toast.error("Por favor, insira um texto para buscar.");
        }

        await searchExecute();
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center text-black flex-col gap-4">
            <input
                type="file"
                hidden
                className="file-input file-input-bordered w-full max-w-xs"
                onChange={(e) => handleUpload(e.target.files ? e.target.files[0] : null)}
                ref={refButton}
                accept=".pdf,.doc,.docx,.txt"
            />

            <p className="text-black mt-2 mb-2 mr-2">{file?.name}</p>

            <button className="bg-amber-500 rounded-2xl px-6 py-3 cursor-pointer text-white" onClick={() => refButton.current?.click()}>
                {loading ? <LoaderCircle className="animate-spin text-white" /> : "Enviar arquivo"}
            </button>

            <textarea
                className="p-2 border border-gray-300 rounded w-full max-w-md"
                placeholder="Digite o texto para busca..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            ></textarea>

            <button className="bg-green-500 rounded-2xl px-6 py-3 cursor-pointer text-white" onClick={handleSearch}>
                {searchLoading ? <LoaderCircle className="animate-spin text-white" /> : "Buscar"}
            </button>
        </div>
    );
}
