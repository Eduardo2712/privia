import { Settings, LogOut } from "lucide-react";

export default function InboxHeader() {
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-gray-800 w-full">
            <p className="text-white text-2xl font-semibold">Privia</p>

            <div className="flex items-center gap-4">
                <button className="bg-blue-500 rounded-2xl px-3 py-2 text-white text-sm hover:bg-blue-600">
                    <Settings className="inline-block mr-2" size={18} />
                    Configurações
                </button>

                <button className="bg-red-500 rounded-2xl px-3 py-2 text-white text-sm hover:bg-red-600">
                    <LogOut className="inline-block mr-2" size={18} />
                    Sair
                </button>
            </div>
        </header>
    );
}
