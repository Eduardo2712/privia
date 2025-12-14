import { useState } from "react";
import toast from "react-hot-toast";
import { remove, searchFileStream } from "../requests/file.request";
import { Sparkles, Send, FileText, Clock, BookOpen, Trash2, Loader2 } from "lucide-react";
import { formatTime } from "../utils/functions";
import { components } from "../types/api-types";
import { useRequest } from "../hooks/use-request.hook";

interface Props {
    readonly fileSelected: components["schemas"]["FileResponseDto"] | null;
    readonly setListFiles: React.Dispatch<React.SetStateAction<components["schemas"]["ListFileResponseDto"]["items"]>>;
    readonly setFileSelected: React.Dispatch<React.SetStateAction<components["schemas"]["FileResponseDto"] | null>>;
}

export default function InboxFileBox({ fileSelected, setListFiles, setFileSelected }: Props) {
    const [streamingText, setStreamingText] = useState<string>("");
    const [references, setReferences] = useState<Array<{ text: string; index: number }>>([]);
    const [timeInMs, setTimeInMs] = useState<number>(0);
    const [streaming, setStreaming] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    const { execute, loading } = useRequest({
        request: () => remove(fileSelected!.id),
        onSuccess: () => {
            setListFiles((prev) => prev.filter((file) => file.id !== fileSelected!.id));
            setStreamingText("");
            setReferences([]);
            setTimeInMs(0);
            setSearchText("");
            setFileSelected(null);

            toast.success("Arquivo deletado com sucesso!");
        },
        onError: () => toast.error("Erro ao deletar arquivo."),
        onFinally: () => setSubmitting(false),
    });

    const handleSearch = async () => {
        if (searchText.trim() === "") {
            return toast.error("Por favor, insira um texto para buscar.");
        }

        if (!fileSelected) {
            return toast.error("Nenhum arquivo selecionado para busca.");
        }

        setStreaming(true);
        setStreamingText("");
        setTimeInMs(0);
        setReferences([]);

        await searchFileStream(
            { search: searchText, documentId: fileSelected.id },
            (chunk) => setStreamingText((prev) => prev + chunk),
            (refs) => setReferences(refs),
            (time) => setTimeInMs(time),
            () => {
                setStreaming(false);
                toast.success("Busca realizada com sucesso!");
            },
            (error) => {
                setStreaming(false);
                toast.error(`Erro ao realizar busca: ${error instanceof Error ? error.message : "Desconhecido"}`);
            }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();

            handleSearch();
        }
    };

    const handleDeleteFile = async () => {
        if (!fileSelected) {
            return;
        }

        setSubmitting(true);

        await execute();
    };

    return (
        <div className="flex flex-col w-full h-full bg-[#1a1a1a]/30">
            {!fileSelected && !streamingText ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="bg-linear-to-br from-blue-500/20 to-purple-500/20 p-6 rounded-2xl border border-white/10 shadow-2xl">
                        <BookOpen size={64} className="text-blue-400 mx-auto" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mt-6 mb-2">Bem-vindo ao Privia</h2>

                    <p className="text-gray-400 text-center max-w-md">
                        Selecione um documento na barra lateral ou envie um novo arquivo para começar a fazer perguntas
                    </p>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                        {streamingText ? (
                            <div className="max-w-4xl mx-auto space-y-6">
                                <div className="bg-linear-to-br from-[#242424] to-[#1e1e1e] rounded-2xl p-6 border border-white/10 shadow-xl">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-linear-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
                                            <Sparkles size={20} className="text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                {streamingText}

                                                {streaming && <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {references.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <FileText size={16} />

                                            <span className="font-semibold">Fontes</span>
                                        </div>

                                        <div className="grid gap-3">
                                            {references.map((r) => (
                                                <div
                                                    key={r.index}
                                                    className="bg-[#242424]/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors duration-200"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold">
                                                            {r.index}
                                                        </span>
                                                        <p className="text-sm text-gray-300 leading-relaxed">{r.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                                            <Clock size={14} />

                                            <span>Tempo de busca: {formatTime(timeInMs)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            fileSelected && (
                                <div className="max-w-4xl mx-auto">
                                    <div className="bg-linear-to-br from-[#242424] to-[#1e1e1e] rounded-2xl p-6 border border-white/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 mb-3">
                                                <FileText size={20} className="text-blue-400" />

                                                <h3 className="text-lg font-semibold text-white">{fileSelected.name}</h3>
                                            </div>

                                            <button
                                                type="button"
                                                className="p-2 border-2 rounded-md border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 transition-colors duration-200 cursor-pointer"
                                                onClick={handleDeleteFile}
                                                disabled={loading || submitting}
                                            >
                                                {loading || submitting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                                            </button>
                                        </div>

                                        <p className="text-gray-400 text-sm">{fileSelected.summary}</p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    <div className="border-t border-white/5 bg-[#1a1a1a]/80 backdrop-blur-xl">
                        <div className="max-w-4xl mx-auto px-6 py-6">
                            <div className="relative">
                                <textarea
                                    className="w-full bg-[#242424] border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none transition-all duration-200 min-h-14 max-h-[200px]"
                                    placeholder="Faça uma pergunta sobre o documento..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    disabled={streaming}
                                />

                                <button
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-blue-500/25 flex items-center justify-center"
                                    onClick={handleSearch}
                                    disabled={streaming || !searchText.trim()}
                                >
                                    {streaming ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send size={20} />
                                    )}
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 mt-3 text-center">Pressione Enter para enviar, Shift + Enter para nova linha</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
