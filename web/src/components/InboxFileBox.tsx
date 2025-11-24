import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { readFile, searchFileStream } from "../requests/file.request";
import { useRequest } from "../hooks/use-request.hook";
import { AxiosRequestConfig } from "axios";
import { LoaderCircle } from "lucide-react";
import { formatTime } from "../utils/functions";

export default function InboxFileBox() {
    const [streamingText, setStreamingText] = useState<string>("");
    const [references, setReferences] = useState<Array<{ text: string; index: number }>>([]);
    const [timeInMs, setTimeInMs] = useState<number>(0);
    const [streaming, setStreaming] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);
    const [searchText, setSearchText] = useState<string>("");

    const { execute, loading } = useRequest({
        request: (config?: AxiosRequestConfig) => readFile(config?.data),
        onSuccess: () => toast.success("Arquivo enviado com sucesso!"),
        onError: () => toast.error("Erro ao enviar arquivo."),
        onFinally: () => setFile(null),
    });

    const refButton = useRef<HTMLInputElement>(null);

    const handleSearch = async () => {
        if (!searchText) {
            return toast.error("Por favor, insira um texto para buscar.");
        }

        setStreaming(true);
        setStreamingText("");
        setTimeInMs(0);
        setReferences([]);

        await searchFileStream(
            { search: searchText },
            (chunk) => setStreamingText((prev) => prev + chunk),
            (refs) => setReferences(refs),
            (time) => setTimeInMs(time),
            () => {
                setStreaming(false);

                toast.success("Busca realizada com sucesso!");
            },
            (error) => {
                setStreaming(false);

                toast.error("Erro ao realizar busca: " + (error instanceof Error ? error.message : "Desconhecido"));
            }
        );
    };

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
        <div className="flex flex-col items-center justify-center space-y-4">
            <input
                type="file"
                hidden
                className="file-input file-input-bordered w-full max-w-xs"
                onChange={(e) => handleUpload(e.target.files ? e.target.files[0] : null)}
                ref={refButton}
                accept=".pdf,.doc,.docx,.txt"
            />

            <p className="text-black mt-2 mb-2 mr-2">{file?.name}</p>

            <button className="bg-amber-500 rounded px-6 py-3 cursor-pointer text-white" onClick={() => refButton.current?.click()}>
                {loading ? <LoaderCircle className="animate-spin text-white" /> : "Enviar arquivo"}
            </button>

            <textarea
                className="p-2 border border-gray-300 rounded w-full max-w-md bg-white"
                placeholder="Digite o texto para busca..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            ></textarea>

            <button className="bg-green-500 rounded px-6 py-3 cursor-pointer text-white" onClick={handleSearch} disabled={streaming}>
                {streaming ? <LoaderCircle className="animate-spin text-white" /> : "Buscar"}
            </button>

            {(streaming || streamingText) && (
                <div className="mt-4 w-full max-w-md p-4 border border-gray-300 rounded bg-white">
                    <h2 className="text-lg font-semibold mb-2">Resultados da Busca:</h2>

                    <div className="whitespace-pre-wrap">{streamingText || "Iniciando busca..."}</div>

                    {references.length > 0 && (
                        <>
                            <div className="mt-4 space-y-2">
                                <h3 className="font-medium">Referências:</h3>

                                {references.map((r) => (
                                    <div key={r.index} className="text-sm border border-gray-200 rounded p-2 bg-gray-50">
                                        <span className="font-semibold">[{r.index}] </span>

                                        {r.text}
                                    </div>
                                ))}
                            </div>

                            <p className="mt-4 text-sm text-gray-900 font-semibold">Tempo de busca: {formatTime(timeInMs)}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
