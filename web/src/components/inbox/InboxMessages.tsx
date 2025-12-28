import { Bot, User, Loader2 } from "lucide-react";
import { components } from "../../types/api-types";
import InboxReferences from "./InboxReferences";
import CustomTooltip from "../CustomTooltip";

interface Props {
    readonly streamingText: string;
    readonly streaming: boolean;
    readonly fileMessages: components["schemas"]["ListMessageResponseDto"] | null;
    readonly searchText: string;
}

export default function InboxMessages({ streamingText, streaming, fileMessages, searchText }: Props) {
    const hasMessages = !!fileMessages && fileMessages.items.length > 0;

    const formatTooltipSource = (message: components["schemas"]["MessageResponseDto"]) => {
        const { content, sources } = message;

        const parts = content.split(/(\[\d+\])/);

        return parts.map((part) => {
            const match = /\[(\d+)\]/.exec(part);

            if (match) {
                const sourceIndex = Number.parseInt(match[1], 10);
                const source = sources.find((s) => s.sourceIndex === sourceIndex);

                if (source) {
                    return (
                        <CustomTooltip key={sourceIndex} content={source.text}>
                            [{source.sourceIndex}]
                        </CustomTooltip>
                    );
                }
            }

            return part;
        });
    };

    return (
        <div className="space-y-6">
            {hasMessages
                ? fileMessages?.items.map((message) => {
                      const isAI = message.type === "AI";

                      return (
                          <div key={message.id} className="max-w-6xl mx-auto space-y-3">
                              <div
                                  className={`rounded-2xl border p-6 shadow-xl transition-colors duration-200 ${
                                      isAI ? "border-white/10 bg-white/5" : "border-white/5 bg-[#0d0d0d]"
                                  }`}
                              >
                                  <div className="flex items-start gap-4">
                                      <div
                                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                              isAI
                                                  ? "bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/30 shadow-lg"
                                                  : "bg-white/10 text-white"
                                          }`}
                                      >
                                          {isAI ? <Bot size={20} /> : <User size={20} />}
                                      </div>

                                      <div className="flex-1 space-y-2">
                                          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-white/50">
                                              <span>{isAI ? "IA" : "Você"}</span>

                                              <span className="h-1 w-1 rounded-full bg-white/30" />

                                              <span className="text-white/40 uppercase">Notas vinculadas ao documento</span>
                                          </div>

                                          <div className="text-gray-100 leading-relaxed whitespace-pre-wrap">{formatTooltipSource(message)}</div>
                                      </div>
                                  </div>
                              </div>

                              {message.sources.length > 0 && <InboxReferences references={message.sources} />}
                          </div>
                      );
                  })
                : !streaming && (
                      <div className="max-w-6xl mx-auto">
                          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/60">
                              Ainda não há interações. Faça sua primeira pergunta para começar o caderno deste documento.
                          </div>
                      </div>
                  )}

            {searchText && streaming && (
                <div className="max-w-6xl mx-auto space-y-3">
                    <div className="rounded-2xl border p-6 shadow-xl transition-colors duration-200 border-blue-500/30 bg-blue-500/10">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                                <User size={20} />
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-blue-300 font-semibold">
                                    <span>Sua Pergunta</span>
                                </div>

                                <div className="text-blue-100 leading-relaxed whitespace-pre-wrap font-medium">{searchText}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(streaming || streamingText) && (
                <div className="max-w-6xl mx-auto space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/30 shadow-lg">
                                <Bot size={20} />
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-white/60">
                                    <span>Gerando</span>

                                    <Loader2 size={14} className="animate-spin text-blue-300" />
                                </div>

                                <div className="min-h-5 whitespace-pre-wrap text-gray-100 leading-relaxed">
                                    {streamingText || "Montando resposta..."}
                                </div>

                                {streaming && <p className="text-[12px] text-blue-200">Atualizando em tempo real</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
