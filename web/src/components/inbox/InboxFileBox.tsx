import { useState } from "react";
import { remove, searchFileStream } from "../../requests/file.request";
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
}

export default function InboxFileBox({ fileSelected, setFiles, setFileSelected, messages }: Props) {
    const [streamingText, setStreamingText] = useState<string>("");
    const [streaming, setStreaming] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>("");

    const fileMessages = fileSelected ? messages[fileSelected.id] : null;

    const alert = useAlert();

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
            () => setStreaming(false),
            (error) => {
                setStreaming(false);

                alert.error(`Erro ao realizar busca: ${error instanceof Error ? error.message : "Desconhecido"}`);
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
        <div className="flex flex-col w-full h-full bg-[#0b0b0b]">
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111111]/70 backdrop-blur-xl p-6 shadow-2xl shadow-black/30">
                            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/5 via-transparent to-blue-500/5" />

                            <div className="relative flex flex-wrap items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-blue-300 shadow-inner shadow-blue-500/10">
                                        <FileText size={24} />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Ativo</p>
                                        <h3 className="text-xl font-semibold text-white leading-tight">{fileSelected.name}</h3>

                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm shadow-black/20 ${
                                                    fileSelected.isProcessed
                                                        ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30"
                                                        : "bg-amber-500/15 text-amber-100 border border-amber-500/30"
                                                }`}
                                            >
                                                {fileSelected.isProcessed ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                                {fileSelected.isProcessed ? "Pronto para perguntas" : "Processando"}
                                            </span>

                                            {metaBadges.map((meta) => (
                                                <span
                                                    key={meta.label}
                                                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70"
                                                >
                                                    <span className="uppercase tracking-[0.08em] text-white/40">{meta.label}</span>
                                                    <span className="font-medium text-white/80">{meta.value}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all duration-200 hover:-translate-y-px hover:border-blue-400 hover:bg-blue-500/10"
                                        title="Ver arquivo original"
                                        disabled={loading}
                                        onClick={() => window.open(fileSelected.url, "_blank")}
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <File size={18} />}
                                        <span className="hidden sm:inline">Abrir original</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition-all duration-200 hover:-translate-y-px hover:border-red-400 hover:bg-red-500/15 disabled:opacity-50"
                                        onClick={handleDeleteFile}
                                        title="Remover arquivo"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                        <span className="hidden sm:inline">Remover</span>
                                    </button>
                                </div>
                            </div>

                            {fileSelected.isProcessed ? (
                                <div className="relative mt-5 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner shadow-black/10">
                                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-white/60">
                                        <Sparkles size={16} className="text-blue-300" />
                                        <span>Resumo rápido</span>
                                    </div>
                                    <p className="mt-2 text-base leading-relaxed text-gray-100">
                                        {fileSelected.summary || "Nenhum resumo disponível para este arquivo."}
                                    </p>
                                </div>
                            ) : (
                                <div className="relative mt-5 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner shadow-black/10">
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <Loader2 size={18} className="animate-spin text-amber-300" />
                                        <span>Preparando seu documento. Assim que finalizar, você poderá fazer perguntas.</span>
                                    </div>

                                    <p className="mt-2 text-[12px] text-white/50">Fique à vontade para explorar enquanto processamos.</p>
                                </div>
                            )}
                        </div>

                        {fileSelected?.isProcessed && fileSelected.suggestedQuestions.length > 0 && (
                            <InboxSuggestedQuestions fileSelected={fileSelected} setSearchText={setSearchText} />
                        )}

                        <div className="pt-2">
                            <InboxMessages fileMessages={fileMessages} streaming={streaming} streamingText={streamingText} />
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 bg-[#0f0f0f]/90 backdrop-blur-xl">
                    <div className="max-w-6xl mx-auto px-6 py-5 space-y-2">
                        <div className="relative">
                            {fileSelected?.isProcessed ? (
                                <>
                                    <textarea
                                        className="w-full rounded-2xl border border-white/10 bg-[#161616] px-5 py-4 pr-16 text-white placeholder-white/40 shadow-inner shadow-black/30 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200 min-h-16 max-h-[220px] resize-none"
                                        placeholder="Faça uma pergunta focada, como 'quais são os insights-chave do resumo?'"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        rows={2}
                                        disabled={streaming}
                                    />

                                    <button
                                        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-xl bg-linear-to-r from-blue-500 to-purple-600 p-3 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-px hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                                        onClick={handleSearch}
                                        disabled={streaming || !searchText.trim()}
                                    >
                                        {streaming ? (
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        ) : (
                                            <Send size={20} />
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                                    <p className="m-0 text-sm text-yellow-100">
                                        O arquivo ainda está sendo processado. Em instantes ele ficará pronto para perguntas.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-[12px] text-white/50">
                            <span>Pressione Enter para enviar · Shift + Enter para nova linha</span>
                            <span>Melhore a resposta sendo específico.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
