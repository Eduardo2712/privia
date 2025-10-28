"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, Inbox, Menu, X } from "lucide-react";
import InboxSidebar from "../../components/inbox/InboxSidebar";
import { list } from "../../requests/message.request";
import toast from "react-hot-toast";
import axios from "axios";
import { components } from "../../types/api-types";
import InboxList from "../../components/inbox/InboxList";
import { formatErrorMessage } from "../../utils/functions";
import InboxMessageViewer from "../../components/inbox/InboxMessageViewer";

type Folder = "inbox" | "starred" | "sent" | "scheduled" | "trash";

export default function Page() {
    const [messages, setMessages] = useState<Array<components["schemas"]["MessageResponseDto"]>>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [query, setQuery] = useState<string>("");
    const [folder, setFolder] = useState<Folder>("inbox");
    const [scheduledAt, setScheduledAt] = useState<string | null>(null);
    const [showPickDatetime, setShowPickDatetime] = useState<boolean>(false);
    const [showSidebar, setShowSidebar] = useState<boolean>(false);
    const [showMessageList, setShowMessageList] = useState<boolean>(true);
    const [showMessageDetail, setShowMessageDetail] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const selected = messages.find((m) => m.id === selectedId) || null;

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);

                const response = await list({ page, search: query });

                if (response.status !== 200) {
                    return toast.error("Ocorreu um erro inesperado.");
                }

                setMessages(response.data.items);
                setIsLoading(false);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    toast.error(formatErrorMessage(error.response?.data?.message));
                } else {
                    toast.error("Ocorreu um erro inesperado");
                }
            }
        })();
    }, [page, query]);

    return (
        <div className="h-screen w-full flex bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative">
            <div
                className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 xl:relative xl:transform-none ${
                    showSidebar ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
                }`}
            >
                <InboxSidebar folder={folder} setFolder={setFolder} query={query} setQuery={setQuery} isLoading={isLoading} />
            </div>

            {showSidebar && (
                <button onClick={() => setShowSidebar(false)} className="fixed inset-0 bg-black/40 z-20 xl:hidden" aria-label="Fechar menu" />
            )}

            <main className="flex-1 flex min-w-0 relative">
                <div className="xl:hidden fixed top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-lg border-b border-neutral-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                    <button
                        onClick={() => setShowSidebar(true)}
                        className="p-2 rounded-xl hover:bg-indigo-50 text-neutral-700 hover:text-indigo-600 transition-colors"
                        aria-label="Abrir menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                            <Inbox className="h-4 w-4 text-white" />
                        </div>

                        <h1 className="font-bold text-neutral-900">Inbox</h1>
                    </div>

                    {showMessageDetail && (
                        <button
                            onClick={() => {
                                setShowMessageDetail(false);
                                setShowMessageList(true);
                            }}
                            className="ml-auto p-2 rounded-xl hover:bg-indigo-50 text-neutral-700 hover:text-indigo-600 transition-colors"
                            aria-label="Voltar"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    )}
                </div>

                <InboxList
                    isLoading={isLoading}
                    messages={messages}
                    selectedId={selectedId}
                    showMessageList={showMessageList}
                    query={query}
                    setQuery={setQuery}
                    setSelectedId={setSelectedId}
                    setMessages={setMessages}
                />

                <InboxMessageViewer selected={selected} showMessageDetail={showMessageDetail} scheduledAt={scheduledAt} />
            </main>

            {showPickDatetime && (
                <div className="fixed inset-0 z-40 bg-black/50 grid place-items-center p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white shadow-2xl">
                        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                            <h3 className="font-bold text-neutral-900">Agendar envio</h3>

                            <button onClick={() => setShowPickDatetime(false)} className="p-1.5 rounded-lg hover:bg-white/80 transition-colors">
                                <X className="h-4 w-4 text-neutral-600" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <label htmlFor="schedule-datetime" className="text-sm font-medium text-neutral-800">
                                Selecione data e hora
                            </label>

                            <input
                                id="schedule-datetime"
                                type="datetime-local"
                                onChange={(e) => setScheduledAt(e.target.value ? new Date(e.target.value).toISOString() : null)}
                                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500/50 focus:border-indigo-300 transition-all"
                            />

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setShowPickDatetime(false)}
                                    className="px-4 py-2 text-sm font-medium rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 transition-colors"
                                >
                                    Cancelar
                                </button>

                                <button
                                    onClick={() => setShowPickDatetime(false)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 transition-all"
                                >
                                    Confirmar <Check className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
