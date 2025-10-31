import { Filter, Inbox, Mail, Search, Send, Star, StarOff } from "lucide-react";
import Loading from "../Loading";
import { useState, type Dispatch, type SetStateAction } from "react";
import { components } from "../../types/api-types";
import { read } from "../../requests/message.request";
import toast from "react-hot-toast";
import axios from "axios";
import { formatErrorMessage } from "../../utils/functions";

interface Props {
    readonly isLoading: boolean;
    readonly messages: Array<components["schemas"]["MessageResponseDto"]>;
    readonly selectedId: number | null;
    readonly showMessageList?: boolean;
    readonly query: string;
    readonly setQuery: Dispatch<SetStateAction<string>>;
    readonly setSelectedId: Dispatch<SetStateAction<number | null>>;
    readonly setMessages: Dispatch<SetStateAction<Array<components["schemas"]["MessageResponseDto"]>>>;
}

export default function InboxList({ isLoading, messages, selectedId, showMessageList, query, setQuery, setSelectedId, setMessages }: Props) {
    const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);

    const selectMessage = async (m: components["schemas"]["MessageResponseDto"]) => {
        setSelectedId(m.id);

        if (m.readAt) {
            return;
        }

        try {
            setMessages((prev) => prev.map((msg) => (msg.id === m.id ? { ...msg, readAt: new Date().toISOString() } : msg)));

            const response = await read(m.id);

            if (response.status !== 200) {
                return toast.error("Ocorreu um erro inesperado.");
            }
        } catch (error) {
            setMessages((prev) => prev.map((msg) => (msg.id === m.id ? { ...msg, readAt: null } : msg)));

            if (axios.isAxiosError(error)) {
                toast.error(formatErrorMessage(error.response?.data?.message));
            } else {
                toast.error("Ocorreu um erro inesperado");
            }
        }
    };

    const channelIcon = (channel: unknown) => {
        const base = "h-4 w-4";

        switch (channel) {
            case "EMAIL":
                return <Mail className={base} />;
            case "TELEGRAM":
                return <Send className={base} />;
            default:
                return null;
        }
    };

    return (
        <section
            className={`w-full xl:w-[460px] shrink-0 border-r border-neutral-200/50 bg-white/80 backdrop-blur-lg flex flex-col shadow-sm ${
                showMessageList ? "flex" : "hidden xl:flex"
            } pt-16 xl:pt-0`}
        >
            <Loading isLoading={isLoading}>
                <div className="px-4 py-3 border-b border-neutral-200/60 flex items-center gap-3 bg-white/60">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-indigo-600 transition-colors" />

                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar mensagens..."
                            className="w-full rounded-xl border border-neutral-200 bg-white/70 pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 ring-indigo-500/50 focus:border-indigo-300 placeholder:text-neutral-500 text-neutral-800 transition-all"
                        />
                    </div>

                    <button
                        onClick={() => setShowUnreadOnly((v) => !v)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border text-xs px-3 py-2 font-medium transition-all duration-200 ${
                            showUnreadOnly
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                                : "border-neutral-200 text-neutral-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700"
                        }`}
                        title="Apenas não lidas"
                    >
                        <Filter className={`h-3.5 w-3.5 ${showUnreadOnly ? "text-white" : ""}`} />

                        <span className="hidden xl:inline">Não lidas</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {messages.length === 0 && (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mb-3">
                                <Inbox className="h-8 w-8 text-indigo-600" />
                            </div>

                            <p className="text-sm text-neutral-600 font-medium">Nenhuma mensagem encontrada</p>
                        </div>
                    )}

                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`relative border-b border-neutral-200/50 transition-all duration-200 ${
                                selectedId === m.id
                                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-l-indigo-500"
                                    : "border-l-4 border-l-transparent hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30"
                            }`}
                        >
                            <button
                                className={`w-full text-left px-4 py-4 focus:outline-none group ${
                                    m.readAt ? "" : "bg-amber-50/50 hover:bg-amber-50/70"
                                }`}
                                onClick={() => selectMessage(m)}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md transition-transform duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 ${
                                            selectedId === m.id ? "scale-110 shadow-lg" : "group-hover:scale-105"
                                        }`}
                                    >
                                        {m.from.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div
                                                className={`truncate text-sm ${
                                                    m.readAt ? "font-semibold text-neutral-700" : "font-bold text-neutral-900"
                                                }`}
                                            >
                                                {m.from}
                                            </div>

                                            <span
                                                className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold transition-colors bg-purple-100 text-purple-700`}
                                            >
                                                {channelIcon(m.type)}

                                                <span className="hidden xl:inline">{m.type}</span>
                                            </span>

                                            {!m.readAt && <span className="h-2 w-2 rounded-full bg-indigo-600 shadow-sm animate-pulse" />}
                                        </div>

                                        <div className={`truncate text-sm mb-1 ${m.readAt ? "text-neutral-700" : "font-semibold text-neutral-900"}`}>
                                            {m.from}
                                        </div>

                                        {m.email.data.text?.trim() !== "" && (
                                            <div className="truncate text-xs text-neutral-600">{m.email.data.text}</div>
                                        )}

                                        <div className="mt-2 text-xs text-neutral-500 font-medium">
                                            {Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
                                                new Date(m.dateLastMessage)
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <button
                                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/80 transition-all duration-200 group/star"
                                title={m.starred ? "Remover estrela" : "Marcar"}
                            >
                                {m.starred ? (
                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500 group-hover/star:scale-110 transition-transform" />
                                ) : (
                                    <StarOff className="h-4 w-4 text-neutral-400 group-hover/star:text-amber-500 group-hover/star:scale-110 transition-all" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </Loading>
        </section>
    );
}
