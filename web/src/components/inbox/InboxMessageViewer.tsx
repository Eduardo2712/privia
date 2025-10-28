import { Archive, CalendarClock, Inbox, MoreVertical, Trash2, X } from "lucide-react";
import InboxAnswerBox from "./InboxAnswerBox";
import { components } from "../../types/api-types";

interface Props {
    readonly selected: components["schemas"]["MessageResponseDto"] | null;
    readonly showMessageDetail?: boolean;
    readonly scheduledAt: string | null;
}

export default function InboxMessageViewer({ selected, showMessageDetail, scheduledAt }: Props) {
    return (
        <section
            className={`flex-1 min-w-0 flex flex-col bg-gradient-to-br from-white to-indigo-50/30 ${
                showMessageDetail ? "flex" : "hidden xl:flex"
            } pt-16 xl:pt-0`}
        >
            {selected ? (
                <>
                    <div className="px-6 py-5 border-b border-neutral-200/70 bg-white/80 backdrop-blur-sm shadow-sm">
                        <div className="flex items-start gap-4">
                            <div
                                className={`h-12 w-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600`}
                            >
                                {selected.from.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="font-bold text-lg truncate text-neutral-900">{selected.from}</h2>

                                    <span
                                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-wide font-bold shadow-sm bg-purple-100 text-purple-700`}
                                    >
                                        {selected.type}
                                    </span>
                                </div>

                                <div className="text-sm text-neutral-600">
                                    De: <span className="font-semibold text-neutral-800">{selected.from}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    className="p-2.5 text-sm rounded-xl border border-neutral-200 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 text-gray-700 transition-all duration-200 hover:shadow-md group"
                                    title="Arquivar"
                                >
                                    <Archive className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                </button>

                                <button
                                    className="p-2.5 text-sm rounded-xl border border-neutral-200 hover:bg-white hover:border-red-200 hover:text-red-600 text-gray-700 transition-all duration-200 hover:shadow-md group"
                                    title="Mover para lixeira"
                                >
                                    <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                </button>

                                <button
                                    className="p-2.5 text-sm rounded-xl border border-neutral-200 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 text-gray-700 transition-all duration-200 hover:shadow-md group"
                                    title="Mais ações"
                                >
                                    <MoreVertical className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200 px-4 py-2 text-xs font-medium shadow-sm">
                            <CalendarClock className="h-4 w-4" />
                            Resposta agendada para {new Date().toLocaleString()}
                            <button className="ml-2 p-1 rounded-lg hover:bg-amber-100 transition-colors" title="Cancelar agenda">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 flex flex-row justify-center">
                        <div dangerouslySetInnerHTML={{ __html: selected.email.data.html ?? "" }}></div>
                    </div>

                    {Boolean(selected) && <InboxAnswerBox selected={selected} scheduledAt={scheduledAt} />}
                </>
            ) : (
                <div className="flex-1 grid place-items-center">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 mb-4 shadow-lg">
                            <Inbox className="h-10 w-10 text-indigo-600" />
                        </div>

                        <h3 className="text-lg font-semibold text-neutral-800 mb-1">Nenhuma mensagem selecionada</h3>

                        <p className="text-sm text-neutral-600">Selecione uma conversa para visualizar os detalhes</p>
                    </div>
                </div>
            )}
        </section>
    );
}
