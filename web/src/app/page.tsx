"use client";

import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";

export default function HomePage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#0f0f0f] via-[#0d1117] to-[#0b0f1a] text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-[#7c3aed]/25 blur-3xl" />

                <div className="absolute -bottom-32 -right-40 h-96 w-96 rounded-full bg-[#22d3ee]/20 blur-3xl" />

                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.12),transparent_30%)]" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-3 py-8 sm:px-6 text-center">
                <div className="space-y-6 sm:space-y-8">
                    <div className="flex items-center justify-center">
                        <div className="rounded-2xl bg-linear-to-r from-[#7c3aed] to-[#22d3ee] p-3 sm:p-4 shadow-lg shadow-[#22d3ee]/30">
                            <Globe className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                        </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
                            Bem-vindo ao <span className="bg-linear-to-r from-[#7c3aed] to-[#22d3ee] bg-clip-text text-transparent">Privia</span>
                        </h1>

                        <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto">
                            Sua plataforma definitiva para gerenciar documentos com inteligência artificial, segurança e velocidade em um ambiente
                            moderno.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2 sm:pt-4">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#7c3aed] to-[#22d3ee] px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-[#22d3ee]/30 transition hover:shadow-[#7c3aed]/30"
                        >
                            <span>Começar agora</span>
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Link>

                        <Link
                            href="/register"
                            className="w-full sm:w-auto rounded-lg border border-white/10 bg-white/5 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white backdrop-blur transition hover:bg-white/10 hover:border-white/20"
                        >
                            Criar conta
                        </Link>
                    </div>

                    <div className="pt-4 sm:pt-6 text-xs sm:text-sm text-white/60">
                        <p>Organize • Gerencie • Simplifique</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
