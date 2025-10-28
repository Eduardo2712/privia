import { CalendarClock, Filter, Inbox, Mail, MessageCircle, MessageSquare, Search, Send, Star, Trash2 } from "lucide-react";
import Loading from "../Loading";

function SideItem({
    active,
    onClick,
    icon,
    label,
    count,
}: Readonly<{
    active?: boolean;
    onClick?: () => void;
    icon: React.ReactNode;
    label: string;
    count?: number;
}>) {
    return (
        <button
            onClick={onClick}
            className={`group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-200"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700"
            }`}
        >
            <span className={`transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`}>{icon}</span>

            <span className="flex-1 text-left">{label}</span>

            {count && count > 0 && (
                <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                        active ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200"
                    }`}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

function ChannelToggle({
    label,
    checked = true,
    onChange = () => {},
    icon,
}: Readonly<{ label: string; checked?: boolean; onChange?: (v: boolean) => void; icon: React.ReactNode }>) {
    return (
        <label className="flex items-center justify-between gap-2 cursor-pointer group py-1 px-2 rounded-lg hover:bg-indigo-50/50 transition-colors">
            <span className="inline-flex items-center gap-2 text-gray-700 text-sm font-medium group-hover:text-indigo-700 transition-colors">
                <span className="text-gray-600 group-hover:text-indigo-600 transition-colors">{icon}</span>
                {label}
            </span>

            <input
                type="checkbox"
                className="w-4 h-4 accent-indigo-600 cursor-pointer transition-transform hover:scale-110"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
        </label>
    );
}

interface Props {
    readonly query: string;
    readonly setQuery: (q: string) => void;
    readonly folder: "inbox" | "starred" | "sent" | "scheduled" | "trash";
    readonly setFolder: (f: "inbox" | "starred" | "sent" | "scheduled" | "trash") => void;
    readonly isLoading: boolean;
}

export default function InboxSidebar({ query, setQuery, folder, setFolder, isLoading }: Props) {
    return (
        <aside className="hidden md:flex shrink-0 w-64 lg:w-72 flex-col p-4 gap-4 h-full sticky">
            <Loading isLoading={isLoading}>
                <div className="flex flex-col gap-5 bg-white/80 backdrop-blur-lg border border-neutral-200/50 rounded-2xl shadow-lg shadow-indigo-100/50 p-5 w-full">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-md">
                                <Inbox className="h-5 w-5 text-white" />
                            </div>

                            <span>Caixa de entrada</span>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-indigo-600 transition-colors" />

                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar mensagens..."
                            className="w-full rounded-xl border border-neutral-200 bg-white/50 pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 ring-indigo-500/50 focus:border-indigo-300 placeholder:text-neutral-500 text-neutral-800 transition-all"
                        />
                    </div>

                    <nav className="space-y-1.5">
                        <SideItem
                            active={folder === "inbox"}
                            onClick={() => setFolder("inbox")}
                            icon={<Inbox className="h-4 w-4" />}
                            label="Entrada"
                            count={1}
                        />

                        <SideItem
                            active={folder === "starred"}
                            onClick={() => setFolder("starred")}
                            icon={<Star className="h-4 w-4" />}
                            label="Marcados"
                            count={1}
                        />

                        <SideItem
                            active={folder === "sent"}
                            onClick={() => setFolder("sent")}
                            icon={<Send className="h-4 w-4" />}
                            label="Enviados"
                            count={1}
                        />

                        <SideItem
                            active={folder === "scheduled"}
                            onClick={() => setFolder("scheduled")}
                            icon={<CalendarClock className="h-4 w-4" />}
                            label="Agendados"
                            count={1}
                        />

                        <SideItem
                            active={folder === "trash"}
                            onClick={() => setFolder("trash")}
                            icon={<Trash2 className="h-4 w-4" />}
                            label="Lixeira"
                            count={1}
                        />
                    </nav>

                    <div className="pt-3 border-t border-neutral-200/70">
                        <div className="flex items-center gap-2 px-2 mb-3">
                            <Filter className="h-3.5 w-3.5 text-indigo-600" />

                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">Filtros</span>
                        </div>

                        <label className="flex items-center gap-2.5 text-sm text-neutral-800 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-indigo-50/50 transition-colors group">
                            <input type="checkbox" className="w-4 h-4 accent-indigo-600 cursor-pointer transition-transform hover:scale-110" />

                            <span className="text-neutral-700 font-medium group-hover:text-indigo-700 transition-colors">Apenas não lidas</span>
                        </label>

                        <div className="flex items-center gap-2 px-2 mt-4 mb-3">
                            <MessageCircle className="h-3.5 w-3.5 text-indigo-600" />

                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">Canais</span>
                        </div>

                        <div className="space-y-1">
                            <ChannelToggle label="Email" icon={<Mail className="h-4 w-4" />} />

                            <ChannelToggle label="SMS" icon={<MessageSquare className="h-4 w-4" />} />

                            <ChannelToggle label="Telegram" icon={<Send className="h-4 w-4" />} />

                            <ChannelToggle label="WhatsApp" icon={<MessageCircle className="h-4 w-4" />} />
                        </div>
                    </div>
                </div>
            </Loading>
        </aside>
    );
}
