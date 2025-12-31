import { Sparkles } from "lucide-react";
import { components } from "../../types/api-types";

interface Props {
    readonly fileSelected: components["schemas"]["FileResponseDto"] | null;
    readonly setSearchText: (text: string) => void;
}

export default function InboxSuggestedQuestions({ fileSelected, setSearchText }: Props) {
    if (!fileSelected?.isProcessed || fileSelected.suggestedQuestions.length === 0) {
        return null;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 md:p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-2 text-white min-w-0">
                        <span className="flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/30 shadow-lg shrink-0">
                            <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </span>

                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold leading-tight">Sugestões</p>

                            <p className="text-[11px] sm:text-[12px] text-white/60">Escolha um prompt e refine.</p>
                        </div>
                    </div>

                    <span className="hidden text-[11px] sm:text-[12px] uppercase tracking-widest text-white/40 md:inline shrink-0">Guia</span>
                </div>

                {fileSelected?.suggestedQuestions && fileSelected.suggestedQuestions.length > 0 ? (
                    <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                        {fileSelected.suggestedQuestions.map((question) => (
                            <button
                                key={question}
                                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-100 transition-colors duration-150 hover:border-blue-400 hover:bg-blue-500/10 hover:text-white"
                                onClick={() => setSearchText(question)}
                            >
                                <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-blue-300" />

                                <span className="line-clamp-1">{question}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="mt-3 text-xs sm:text-sm text-white/60">Nenhuma pergunta sugerida disponível.</p>
                )}
            </div>
        </div>
    );
}
