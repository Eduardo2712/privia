"use client";

import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <div className="mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="p-4 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl">
                            <Globe className="h-12 w-12 text-white" />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Bem-vindo ao <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Privia</span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Sua plataforma definitiva para gerenciar documentos e informações com eficiência e segurança.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/login"
                        className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-medium text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                        <span>Começar agora</span>
                        <ArrowRight className="h-5 w-5" />
                    </Link>

                    <Link
                        href="/register"
                        className="text-gray-600 hover:text-gray-900 font-medium text-lg transition-colors border border-gray-300 hover:border-gray-400 px-8 py-4 rounded-xl"
                    >
                        Criar conta
                    </Link>
                </div>

                <div className="mt-12 text-gray-500">
                    <p>Organize • Gerencie • Simplifique</p>
                </div>
            </div>
        </div>
    );
}
