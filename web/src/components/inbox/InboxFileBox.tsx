import { useState, useRef, useEffect } from "react";
import { getLastestMessages, remove, searchFileStream } from "../../requests/file.request";
import { Send, FileText, Trash2, Loader2, File, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { formatBytes, formatDatePtBr, formatErrorMessage } from "../../utils/functions";
import { components } from "../../types/api-types";
import { useRequest } from "../../hooks/use-request.hook";
import InboxSuggestedQuestions from "./InboxSuggestedQuestions";
import { useAlert } from "../../hooks/use-alert.hook";
import InboxEmpty from "./InboxEmpty";
import InboxMessages from "./InboxMessages";

interface Props {
    readonly fileSelected: components["schemas"]["FileResponseDto"] | null;
    readonly setFiles: React.Dispatch<React.SetStateAction<components["schemas"]["ListFileResponseDto"]>>;
    readonly setFileSelected: React.Dispatch<React.SetStateAction<components["schemas"]["FileResponseDto"] | null>>;
    readonly messages: Record<string, components["schemas"]["ListMessageResponseDto"]>;
    readonly setMessages: React.Dispatch<React.SetStateAction<Record<string, components["schemas"]["ListMessageResponseDto"]>>>;
}

export default function InboxFileBox({ fileSelected, setFiles, setFileSelected, messages, setMessages }: Props) {
    const [streamingText, setStreamingText] = useState<string>("");
    const [streaming, setStreaming] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>("");

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const fileMessages = fileSelected ? messages[fileSelected.id] : null;

    const alert = useAlert();

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;

        if (scrollContainer) {
            setTimeout(() => {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }, 0);
        }
    }, [fileMessages, fileSelected, streamingText, streaming]);

    const { execute, loading } = useRequest({
        request: () => remove(fileSelected!.id),
        onSuccess: () => {
            setFiles((prev) => ({ ...prev, items: prev.items.filter((file) => file.id !== fileSelected!.id) }));
            setStreamingText("");
            setSearchText("");
            setFileSelected(null);

            alert.success("Arquivo excluído com sucesso!");
        },
        onError: (err) => alert.error(formatErrorMessage(err.response?.data)),
    });

    const { execute: executeGetLastestMessages } = useRequest({
        request: () => getLastestMessages(fileSelected!.id),
        onSuccess: (data) => {
            setMessages((prev) => ({
                ...prev,
                [fileSelected!.id]: {
                    ...prev[fileSelected!.id],
                    items: [...(prev[fileSelected!.id]?.items || []), ...data],
                },
            }));
        },
        onError: (err) => alert.error(formatErrorMessage(err.response?.data)),
    });

    const handleSearch = async () => {
        if (!fileSelected) {
            return alert.error("Nenhum arquivo selecionado para busca.");
        }

        if (searchText.trim() === "") {
            return alert.error("Por favor, insira um texto para buscar.");
        }

        setStreaming(true);
        setStreamingText("");

        await searchFileStream(
            { search: searchText, documentId: fileSelected.id },
            (chunk) => setStreamingText((prev) => prev + chunk),
            async () => {
                setStreaming(false);
                setStreamingText("");

                await executeGetLastestMessages();
            },
            (error) => {
                setStreaming(false);
                setStreamingText("");

                alert.error(`Erro ao realizar busca: ${error instanceof Error ? error.message : "Desconhecido"}`);
            },
            () => setSearchText("")
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

        const confirmed = await alert.confirm("Deseja realmente remover esse arquivo?", {
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
        });

        if (confirmed) {
            await execute();
        }
    };

    if (!fileSelected) {
        return <InboxEmpty />;
    }

    const metaBadges = [
        { label: "Tipo", value: fileSelected.mimeType },
        { label: "Tamanho", value: formatBytes(fileSelected.size) },
        { label: "Atualizado", value: formatDatePtBr(fileSelected.updatedAt) },
    ];

    return (
        <div className="flex flex-col w-full flex-1 md:h-full bg-[#0b0b0b] min-h-0">
            <div className="flex flex-col h-full min-h-0">
                <div className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-2 sm:pb-2.5 md:pb-3 shrink-0">
                    <div className="max-w-6xl mx-auto">
                        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#111111]/70 backdrop-blur-xl p-3 sm:p-4 md:p-6 shadow-2xl shadow-black/30">
                            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/5 via-transparent to-blue-500/5" />

                            <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                                <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                                    <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-2xl bg-white/5 text-blue-300 shadow-inner shadow-blue-500/10 shrink-0">
                                        <FileText size={20} className="sm:w-6 sm:h-6" />
                                    </div>

                                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                                        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-white/50">Ativo</p>

                                        <h3
                                            className="text-base sm:text-lg md:text-xl font-semibold text-white leading-tight truncate"
                                            title={fileSelected.name}
                                        >
                                            {fileSelected.name}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium shadow-sm shadow-black/20 ${
                                                    fileSelected.isProcessed
                                                        ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30"
                                                        : "bg-amber-500/15 text-amber-100 border border-amber-500/30"
                                                }`}
                                            >
                                                {fileSelected.isProcessed ? (
                                                    <CheckCircle2 size={12} className="sm:w-3.5 sm:h-3.5" />
                                                ) : (
                                                    <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                                                )}

                                                <span className="hidden sm:inline">{fileSelected.isProcessed ? "Pronto" : "Processando"}</span>
                                                <span className="sm:hidden">{fileSelected.isProcessed ? "OK" : "..."}</span>
                                            </span>

                                            {metaBadges.map((meta) => (
                                                <span
                                                    key={meta.label}
                                                    className="hidden md:inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70"
                                                >
                                                    <span className="uppercase tracking-[0.08em] text-white/40 hidden lg:inline">{meta.label}</span>

                                                    <span className="font-medium text-white/80">{meta.value}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white transition-all duration-200 hover:-translate-y-px hover:border-blue-400 hover:bg-blue-500/10"
                                        title="Ver arquivo original"
                                        disabled={loading}
                                        onClick={() => window.open(fileSelected.url, "_blank")}
                                    >
                                        {loading ? (
                                            <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin" />
                                        ) : (
                                            <File size={16} className="sm:w-[18px] sm:h-[18px]" />
                                        )}

                                        <span className="hidden sm:inline">Abrir</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl border border-red-500/30 bg-red-500/10 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-200 transition-all duration-200 hover:-translate-y-px hover:border-red-400 hover:bg-red-500/15 disabled:opacity-50"
                                        onClick={handleDeleteFile}
                                        title="Remover arquivo"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin" />
                                        ) : (
                                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                        )}

                                        <span className="hidden sm:inline">Remover</span>
                                    </button>
                                </div>
                            </div>

                            {fileSelected.isProcessed ? (
                                <div className="relative mt-3 sm:mt-4 md:mt-5 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 md:p-5 shadow-inner shadow-black/10">
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-white/60">
                                        <Sparkles size={14} className="sm:w-4 sm:h-4 text-blue-300" />

                                        <span>Resumo</span>
                                    </div>

                                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-100">
                                        {fileSelected.summary || "Nenhum resumo disponível para este arquivo."}
                                    </p>
                                </div>
                            ) : (
                                <div className="relative mt-3 sm:mt-4 md:mt-5 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 md:p-5 shadow-inner shadow-black/10">
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/80">
                                        <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin text-amber-300" />

                                        <span>Preparando seu documento. Em breve você poderá fazer perguntas.</span>
                                    </div>

                                    <p className="mt-2 text-[11px] sm:text-[12px] text-white/50">Você pode explorar enquanto processamos.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 pb-4 sm:pb-6 custom-scrollbar min-h-0">
                    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
                        <InboxSuggestedQuestions fileSelected={fileSelected} setSearchText={setSearchText} />

                        <InboxMessages fileMessages={fileMessages} streaming={streaming} streamingText={streamingText} searchText={searchText} />
                    </div>
                </div>

                <div className="border-t border-white/5 bg-[#0f0f0f]/90 backdrop-blur-xl shrink-0">
                    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 space-y-1.5 sm:space-y-2">
                        <div className="relative">
                            {fileSelected?.isProcessed ? (
                                <>
                                    <textarea
                                        className="w-full rounded-2xl border border-white/10 bg-[#161616] px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 pr-12 sm:pr-14 text-sm md:text-base text-white placeholder-white/40 shadow-inner shadow-black/30 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200 min-h-12 sm:min-h-16 max-h-[220px] resize-none"
                                        placeholder="Faça uma pergunta focada, como 'quais são os insights-chave?'"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        rows={2}
                                        disabled={streaming}
                                    />

                                    <button
                                        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-lg sm:rounded-xl bg-linear-to-r from-blue-500 to-purple-600 p-2 sm:p-2.5 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                                        onClick={handleSearch}
                                        disabled={streaming || !searchText.trim()}
                                    >
                                        {streaming ? (
                                            <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        ) : (
                                            <Send size={18} className="sm:w-5 sm:h-5" />
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3 sm:p-4">
                                    <p className="m-0 text-xs sm:text-sm text-yellow-100">Arquivo sendo processado. Em instantes ficará pronto.</p>
                                </div>
                            )}
                        </div>

                        {fileSelected?.isProcessed && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] sm:text-[12px] text-white/50 gap-1.5">
                                <span>Enter para enviar · Shift + Enter para quebra</span>

                                <span className="hidden sm:inline">Seja específico para respostas melhores</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
