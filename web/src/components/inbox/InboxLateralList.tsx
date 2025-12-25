import { FileText, Plus, Loader2 } from "lucide-react";
import { components } from "../../types/api-types";
import { useEffect, useRef } from "react";
import { useRequest } from "../../hooks/use-request.hook";
import { AxiosRequestConfig } from "axios";
import { get, readFile } from "../../requests/file.request";
import useSocket from "../../hooks/use-socket.hook";
import { ServerToClientEventsInterface } from "../../interfaces/socket.interface";
import Loading from "../Loading";
import { useAlert } from "../../hooks/use-alert.hook";
import { formatErrorMessage } from "../../utils/functions";
import ProgressBar from "../ProgressBar";

interface Props {
    readonly files: components["schemas"]["ListFileResponseDto"];
    readonly setFiles: React.Dispatch<React.SetStateAction<components["schemas"]["ListFileResponseDto"]>>;
    readonly setFileSelected: (file: components["schemas"]["FileResponseDto"]) => void;
    readonly fileSelected: components["schemas"]["FileResponseDto"] | null;
    readonly handleFileSelected: (file: components["schemas"]["FileResponseDto"]) => void;
}

export default function InboxLateralList({ files, setFiles, setFileSelected, fileSelected, handleFileSelected }: Props) {
    const refInputFile = useRef<HTMLInputElement>(null);

    const alert = useAlert();

    const { socket } = useSocket();

    const { execute, loading } = useRequest({
        request: (config?: AxiosRequestConfig) => readFile(config?.data),
        onSuccess: (data) => setFiles((prev) => ({ ...prev, items: [data, ...prev.items], totalItems: prev.totalItems + 1 })),
        onError: (err) => alert.error(formatErrorMessage(err.response?.data)),
    });

    const { execute: executeGet } = useRequest({
        request: (config?: AxiosRequestConfig) => get(config?.data),
        onSuccess: (data) => {
            setFiles((prev) => ({ ...prev, items: prev.items.map((f) => (f.id === data.id ? data : f)) }));

            if (fileSelected?.id === data.id) {
                setFileSelected(data);
            }
        },
        onError: (err) => alert.error(formatErrorMessage(err.response?.data)),
    });

    useEffect(() => {
        if (!socket) {
            return;
        }

        const handleFileProcessed = async (data: ServerToClientEventsInterface["file:processed"]) => {
            await executeGet({ data: data.id });
        };

        const handleFileProgress = (data: ServerToClientEventsInterface["file:progress"]) => {
            setFiles((prev) => ({ ...prev, items: prev.items.map((f) => (f.id === data.id ? { ...f, progress: data.progress } : f)) }));
        };

        socket.on("file:processed", handleFileProcessed);
        socket.on("file:progress", handleFileProgress);

        return () => {
            socket.off("file:processed", handleFileProcessed);
            socket.off("file:progress", handleFileProgress);
        };
    }, [socket, executeGet, setFiles]);

    const handleUpload = async (file: File | null) => {
        if (!file) {
            return;
        }

        const formData = new FormData();

        formData.append("file", file);

        await execute({ data: formData, headers: { "Content-Type": "multipart/form-data" } });
    };

    return (
        <aside className="bg-[#1a1a1a]/50 backdrop-blur-sm text-white w-full max-w-[280px] h-full flex-col flex justify-between border-r border-white/5">
            <div className="flex flex-col h-full">
                <div className="px-4 py-4 border-b border-white/5">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Documentos</h2>

                    <p className="text-xs text-gray-500 mt-1">
                        {files.items.length} arquivo{files.items.length === 1 ? "" : "s"}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
                    {files.items.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                            <FileText size={48} className="text-gray-600 mb-3" />

                            <p className="text-sm text-gray-400">Nenhum documento ainda</p>

                            <p className="text-xs text-gray-600 mt-1">Envie seu primeiro arquivo</p>
                        </div>
                    )}

                    {files.items.length > 0 && (
                        <ul className="space-y-1.5">
                            {files.items.map((file) => (
                                <li key={file.id}>
                                    <button
                                        className={`group w-full text-left px-3 py-3 rounded-xl transition-all duration-200 flex items-start gap-3 ${
                                            fileSelected?.id === file.id
                                                ? "bg-linear-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                                                : "hover:bg-white/5 border border-transparent hover:border-white/10"
                                        }`}
                                        onClick={() => handleFileSelected(file)}
                                    >
                                        <div
                                            className={`mt-0.5 ${
                                                fileSelected?.id === file.id ? "text-blue-400" : "text-gray-500 group-hover:text-gray-400"
                                            }`}
                                        >
                                            <FileText size={18} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm font-medium truncate ${
                                                    fileSelected?.id === file.id ? "text-white" : "text-gray-300"
                                                }`}
                                            >
                                                {file.name}
                                            </p>

                                            <ProgressBar progress={file.progress} />
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {loading && <Loading isLoading={loading} />}
                </div>

                <div className="px-3 py-4 border-t border-white/5">
                    <input
                        type="file"
                        hidden
                        onChange={(e) => handleUpload(e.target.files ? e.target.files[0] : null)}
                        ref={refInputFile}
                        accept=".pdf,.doc,.docx,.txt"
                        disabled={loading}
                    />

                    <button
                        type="button"
                        className="group w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => refInputFile.current?.click()}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        )}

                        {!loading && "Novo documento"}
                    </button>
                </div>
            </div>
        </aside>
    );
}
