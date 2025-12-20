import { components } from "../../types/api-types";

interface Props {
    readonly fileSelected: components["schemas"]["FileResponseDto"] | null;
    readonly setSearchText: (text: string) => void;
}

export default function InboxSuggestedQuestions({ fileSelected, setSearchText }: Props) {
    return (
        <div className="max-w-7xl mx-auto mt-4">
            <div className="bg-linear-to-br from-[#242424] to-[#1e1e1e] rounded-2xl p-6 border border-white/10">
                <p className="text-white font-medium mb-4">Perguntas Sugeridas</p>

                {fileSelected?.suggestedQuestions && fileSelected.suggestedQuestions.length > 0 ? (
                    <div className="space-y-2">
                        {fileSelected.suggestedQuestions.map((question) => (
                            <button
                                key={question}
                                className="w-full text-left bg-white/5 hover:bg-white/10 transition-colors duration-200 rounded-lg p-4 cursor-pointer"
                                onClick={() => setSearchText(question)}
                            >
                                <p className="text-gray-300">{question}</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Nenhuma pergunta sugerida disponível.</p>
                )}
            </div>
        </div>
    );
}
