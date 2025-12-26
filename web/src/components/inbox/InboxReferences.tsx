import { ArrowDown, ArrowUp, FileText } from "lucide-react";
import { useState } from "react";
import { components } from "../../types/api-types";

interface Props {
    readonly references: components["schemas"]["MessageSourceResponseDto"][];
}

export default function InboxReferences({ references }: Props) {
    const [openReferences, setOpenReferences] = useState(false);

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => setOpenReferences(!openReferences)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#242424]/50 border border-white/5 rounded-xl hover:border-white/10 hover:bg-[#242424]/70 transition-colors duration-200"
            >
                <div className="flex items-center gap-2 text-sm text-gray-300 font-semibold">
                    <FileText size={16} />
                    <span>Fontes ({references.length})</span>
                </div>

                <div className="text-gray-400 transition-transform duration-200">
                    {openReferences ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </div>
            </button>

            {openReferences && (
                <div className="grid gap-3">
                    {references.map((r) => (
                        <div
                            key={r.sourceIndex}
                            className="bg-[#242424]/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors duration-200"
                        >
                            <div className="flex items-start gap-3">
                                <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold">
                                    {r.sourceIndex}
                                </span>

                                <p className="text-sm text-gray-300 leading-relaxed">{r.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
