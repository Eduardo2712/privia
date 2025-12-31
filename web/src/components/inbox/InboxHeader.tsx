import { Settings, LogOut, Sparkles } from "lucide-react";
import { useRequest } from "../../hooks/use-request.hook";
import { logout } from "../../requests/auth.request";
import { useAlert } from "../../hooks/use-alert.hook";
import { formatErrorMessage } from "../../utils/functions";

export default function InboxHeader() {
    const alert = useAlert();

    const { execute } = useRequest({
        request: () => logout(),
        onSuccess: () => {
            globalThis.window.location.href = "/";

            alert.success("Logout realizado com sucesso!");
        },
        onError: (err) => alert.error(formatErrorMessage(err.response?.data)),
    });

    const handleLogout = async () => {
        const confirmed = await alert.confirm("Deseja realmente sair?", {
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
        });

        if (confirmed) {
            await execute();

            alert.success("Logout realizado com sucesso!");
        }
    };

    return (
        <header className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-[#1e1e1e]/80 backdrop-blur-xl border-b border-white/5 w-full">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="bg-linear-to-br from-blue-500 to-purple-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
                    <Sparkles size={20} className="sm:w-6 sm:h-6 text-white w-5 h-5" />
                </div>

                <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent truncate">
                    Privia
                </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button className="group hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-gray-300 text-xs sm:text-sm font-medium hover:bg-white/5 transition-all duration-200 border border-white/5 hover:border-white/10">
                    <Settings size={16} className="sm:w-[18px] sm:h-[18px] group-hover:rotate-90 transition-transform duration-300" />

                    <span className="hidden sm:inline">Configurações</span>
                </button>

                <button
                    onClick={() => handleLogout()}
                    className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-gray-300 text-xs sm:text-sm font-medium hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 border border-white/5 hover:border-red-500/30"
                >
                    <LogOut size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-0.5 transition-transform duration-200" />

                    <span className="hidden sm:inline">Sair</span>
                </button>
            </div>
        </header>
    );
}
