import { BookOpen } from "lucide-react";

export default function InboxEmpty() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="bg-linear-to-br from-blue-500/20 to-purple-500/20 p-6 rounded-2xl border border-white/10 shadow-2xl">
                <BookOpen size={64} className="text-blue-400 mx-auto" />
            </div>

            <h2 className="text-2xl font-bold text-white mt-6 mb-2">Olá</h2>

            <p className="text-gray-400 text-center max-w-md">
                Selecione um documento na barra lateral ou envie um novo documento para começar a fazer perguntas
            </p>
        </div>
    );
}
