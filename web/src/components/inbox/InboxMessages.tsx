import { Sparkles } from "lucide-react";
import { components } from "../../types/api-types";
import InboxReferences from "./InboxReferences";

interface Props {
    readonly streamingText: string;
    readonly streaming: boolean;
    readonly fileMessages: components["schemas"]["ListMessageResponseDto"] | null;
}

export default function InboxMessages({ streamingText, streaming, fileMessages }: Props) {
    return (
        <>
            {fileMessages && fileMessages.items.length > 0 && (
                <>
                    {fileMessages.items.map((message) => (
                        <div key={message.id} className="max-w-7xl mx-auto space-y-6 mt-6">
                            <div className="bg-linear-to-br from-[#242424] to-[#1e1e1e] rounded-2xl p-6 border border-white/10 shadow-xl">
                                <div className="flex items-start gap-4">
                                    <div className="bg-linear-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
                                        <Sparkles size={20} className="text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{message.content}</div>
                                    </div>
                                </div>
                            </div>

                            {message.sources.length > 0 && <InboxReferences references={message.sources} />}
                        </div>
                    ))}
                </>
            )}
        </>
    );
}
