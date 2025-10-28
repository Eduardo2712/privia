import { Bot, CalendarClock, ChevronDown, Paperclip, Reply, Send } from "lucide-react";
import { components } from "../../types/api-types";
import { useState } from "react";

interface Props {
    readonly selected: components["schemas"]["MessageResponseDto"];
    readonly scheduledAt: string | null;
}

export default function InboxAnswerBox({ selected, scheduledAt }: Props) {
    const [reply, setReply] = useState<string>("");

    const sendReply = () => {};

    return (
        <div className="border-t border-neutral-200/70 bg-white/90 backdrop-blur-lg px-6 py-5 shadow-lg">
            <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="px-4 pt-3 pb-2 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 text-xs uppercase tracking-wide text-neutral-700 flex items-center gap-2 font-semibold border-b border-neutral-200/50">
                    <Reply className="h-4 w-4 text-indigo-600" />
                    Responder para {selected.from}
                </div>

                <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Escreva sua resposta..."
                    rows={4}
                    className="w-full resize-none outline-none px-4 py-3 text-sm bg-transparent placeholder:text-neutral-500 text-neutral-800"
                />

                <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200/50 bg-neutral-50/30">
                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-neutral-200 text-neutral-700 hover:text-indigo-600 transition-all duration-200"
                            title="Anexar arquivo"
                        >
                            <Paperclip className="h-4 w-4" />
                        </button>

                        <div className="relative">
                            <button
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 text-neutral-700 ${
                                    scheduledAt
                                        ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 shadow-sm"
                                        : "border-neutral-200 hover:bg-white hover:shadow-sm hover:border-indigo-200 hover:text-indigo-700"
                                }`}
                                title="Agendar envio"
                            >
                                <CalendarClock className="h-4 w-4" />

                                <span>{scheduledAt ? "Agendado" : "Agendar"}</span>

                                <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <button
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200 text-sm font-medium disabled:opacity-60 disabled:cursor-not-wait transition-all duration-200 hover:shadow-sm text-neutral-700 hover:text-purple-700"
                            title="Escrever com IA"
                        >
                            <Bot className="h-4 w-4" />

                            <span>{"IA"}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setReply("")}
                            className="px-4 py-2 text-sm font-medium rounded-xl border border-neutral-200 hover:bg-white hover:border-neutral-300 text-neutral-700 transition-all duration-200 hover:shadow-sm"
                        >
                            Limpar
                        </button>

                        <button
                            onClick={sendReply}
                            disabled={!reply.trim()}
                            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 hover:shadow-xl transition-all duration-200 hover:scale-105"
                        >
                            <span>Enviar</span>

                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
