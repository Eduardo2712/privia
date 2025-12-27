import { Sparkles } from "lucide-react";
import { components } from "../../types/api-types";

interface Props {
    readonly fileSelected: components["schemas"]["FileResponseDto"] | null;
    readonly setSearchText: (text: string) => void;
}

export default function InboxSuggestedQuestions({ fileSelected, setSearchText }: Props) {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-white">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/30 shadow-lg">
                            <Sparkles size={18} />
                        </span>

                        <div>
                            <p className="text-sm font-semibold">Sugestões rápidas</p>

                            <p className="text-[12px] text-white/60">Comece: escolha um prompt e refine.</p>
                        </div>
                    </div>

                    <span className="hidden text-[12px] uppercase tracking-widest text-white/40 sm:inline">Guia de perguntas</span>
                </div>

                {fileSelected?.suggestedQuestions && fileSelected.suggestedQuestions.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {fileSelected.suggestedQuestions.map((question) => (
                            <button
                                key={question}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-100 transition-colors duration-150 hover:border-blue-400 hover:bg-blue-500/10 hover:text-white"
                                onClick={() => setSearchText(question)}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />

                                {question}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="mt-3 text-sm text-white/60">Nenhuma pergunta sugerida disponível.</p>
                )}
            </div>
        </div>
    );
}
