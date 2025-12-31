import { BookOpen } from "lucide-react";

export default function InboxEmpty() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-4">
            <div className="bg-linear-to-br from-blue-500/20 to-purple-500/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl">
                <BookOpen size={48} className="sm:w-16 sm:h-16 text-blue-400 mx-auto" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mt-4 sm:mt-6 mb-2">Olá</h2>

            <p className="text-xs sm:text-sm text-gray-400 text-center max-w-sm">
                Selecione um documento na barra lateral ou envie um novo para começar
            </p>
        </div>
    );
}
