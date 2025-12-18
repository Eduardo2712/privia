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
        <header className="flex items-center justify-between px-8 py-5 bg-[#1e1e1e]/80 backdrop-blur-xl border-b border-white/5 w-full">
            <div className="flex items-center gap-3">
                <div className="bg-linear-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                    <Sparkles size={24} className="text-white" />
                </div>

                <p className="text-2xl font-bold tracking-tight bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">Privia</p>
            </div>

            <div className="flex items-center gap-3">
                <button className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-300 text-sm font-medium hover:bg-white/5 transition-all duration-200 border border-white/5 hover:border-white/10">
                    <Settings size={18} className="group-hover:rotate-90 transition-transform duration-300" />

                    <span className="hidden sm:inline">Configurações</span>
                </button>

                <button
                    onClick={() => handleLogout()}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-300 text-sm font-medium hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 border border-white/5 hover:border-red-500/30"
                >
                    <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform duration-200" />

                    <span className="hidden sm:inline">Sair</span>
                </button>
            </div>
        </header>
    );
}
