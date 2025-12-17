"use client";

import Link from "next/link";
import { Formik, Form } from "formik";
import { validationLogin } from "../../utils/validations";
import { Mail, MessageSquare, Lock, Zap, Smile, Star, Globe, Unlock, Loader2, FastForward, Brain } from "lucide-react";
import { login } from "../../requests/auth.request";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CustomInput } from "../../components/CustomInput";
import { useState } from "react";
import { formatErrorMessage } from "../../utils/functions";
import { LoginResponse } from "../../interfaces/auth.interface";

export default function Page() {
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    const initialValues = {
        email: "",
        password: "",
    };

    const onSubmit = async (values: typeof initialValues) => {
        try {
            const response = await login(values);

            if (response.status !== 200) {
                return toast.error("Falha ao autenticar. Tente novamente.");
            }

            const loginResponse = response.data as unknown as LoginResponse;

            localStorage.setItem("user", JSON.stringify(loginResponse.user));

            toast.success("Login realizado com sucesso!");

            router.push("/inbox");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(formatErrorMessage(error.response?.data?.message));
            } else {
                toast.error("Ocorreu um erro inesperado");
            }
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#0f0f0f] via-[#0d1117] to-[#0b0f1a] text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 -left-28 h-80 w-80 rounded-full bg-[#7c3aed]/30 blur-3xl" />

                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#22d3ee]/25 blur-3xl" />

                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.1),transparent_30%)]" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-3 py-8 sm:px-6 lg:px-8">
                <div className="grid items-center gap-8 lg:gap-12 lg:grid-cols-2">
                    <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/80 ring-1 ring-white/10 backdrop-blur">
                            <Zap className="h-4 w-4 text-[#22d3ee]" />
                            Plataforma segura e ágil
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">
                                Organize seus documentos com foco em{" "}
                                <span className="mx-1 sm:mx-2 bg-linear-to-r from-[#7c3aed] to-[#22d3ee] bg-clip-text text-transparent">
                                    privacidade
                                </span>{" "}
                                e{" "}
                                <span className="mx-1 sm:ml-2 bg-linear-to-r from-[#22d3ee] to-[#7c3aed] bg-clip-text text-transparent">
                                    velocidade
                                </span>
                            </h1>

                            <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto lg:mx-0">
                                Envie, consulte e converse com seus arquivos em um ambiente escuro inspirado na sua caixa de entrada principal.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                            {[
                                { icon: FastForward, label: "Velocidade" },
                                { icon: MessageSquare, label: "Chat" },
                                { icon: Brain, label: "IA" },
                                { icon: Zap, label: "Automação" },
                            ].map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-2 sm:px-3 py-2 text-xs sm:text-sm text-white/80 backdrop-blur transition hover:border-[#7c3aed]/60 hover:bg-white/10"
                                >
                                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/5 text-[#22d3ee] ring-1 ring-white/10 transition group-hover:text-white flex-shrink-0">
                                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>

                                    <span className="font-medium text-center sm:text-left">{label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-white/20 bg-linear-to-br from-[#7c3aed] to-[#22d3ee] flex items-center justify-center shadow-lg shadow-[#7c3aed]/20 flex-shrink-0"
                                    >
                                        <Smile className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                    </div>
                                ))}
                            </div>

                            <div className="text-xs sm:text-sm text-white/70">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300 fill-yellow-300 flex-shrink-0" />

                                    <span className="font-semibold text-white">5.0</span>

                                    <span className="hidden xs:inline">• +1k</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-sm sm:max-w-md lg:max-w-xl mx-auto lg:mx-0">
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 lg:p-8 shadow-2xl backdrop-blur">
                            <div className="pointer-events-none absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.18),transparent_40%)]" />

                            <div className="relative z-10 text-center mb-4 sm:mb-6 lg:mb-8">
                                <div className="mx-auto mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-linear-to-r from-[#7c3aed] to-[#22d3ee] shadow-lg shadow-[#22d3ee]/30">
                                    <Globe className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                                </div>

                                <h2 className="text-xl sm:text-2xl font-bold text-white">Bem-vindo de volta</h2>

                                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/70">Acesse sua conta e continue de onde parou.</p>
                            </div>

                            <Formik initialValues={initialValues} validationSchema={validationLogin} onSubmit={onSubmit}>
                                {({ isSubmitting }) => (
                                    <Form className="relative z-10 space-y-3 sm:space-y-4 lg:space-y-5">
                                        <CustomInput
                                            label="Email"
                                            name="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            IconLeft={Mail}
                                            required
                                            labelClassName="text-white text-sm sm:text-base"
                                            inputClassName="bg-white/5 border-white/10 text-white placeholder-white/40 focus:ring-[#22d3ee] focus:border-transparent text-sm sm:text-base py-2 sm:py-3"
                                        />

                                        <CustomInput
                                            label="Senha"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            IconLeft={Lock}
                                            maxLength={30}
                                            ComponentRight={
                                                showPassword ? (
                                                    <Unlock
                                                        className="cursor-pointer rounded-sm bg-linear-to-r from-[#7c3aed] to-[#22d3ee] px-1 py-1 text-white h-5 w-5"
                                                        onClick={() => setShowPassword((prev) => !prev)}
                                                    />
                                                ) : (
                                                    <Lock
                                                        className="cursor-pointer rounded-sm bg-linear-to-r from-[#7c3aed] to-[#22d3ee] px-1 py-1 text-white h-5 w-5"
                                                        onClick={() => setShowPassword((prev) => !prev)}
                                                    />
                                                )
                                            }
                                            required
                                            labelClassName="text-white text-sm sm:text-base"
                                            inputClassName="bg-white/5 border-white/10 text-white placeholder-white/40 focus:ring-[#22d3ee] focus:border-transparent text-sm sm:text-base py-2 sm:py-3"
                                        />

                                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3 text-xs sm:text-sm">
                                            <label htmlFor="remember-me" className="flex items-center gap-2 text-white/80 whitespace-nowrap">
                                                <input
                                                    id="remember-me"
                                                    name="remember-me"
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-[#22d3ee] focus:ring-[#22d3ee]"
                                                />

                                                <span>Lembrar de mim</span>
                                            </label>

                                            <Link
                                                href="/forgot-password"
                                                className="text-[#22d3ee] hover:text-white transition-colors text-center xs:text-right"
                                            >
                                                Esqueceu a senha?
                                            </Link>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex w-full items-center justify-center rounded-lg bg-linear-to-r from-[#7c3aed] to-[#22d3ee] px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-[#22d3ee]/30 transition hover:shadow-[#7c3aed]/30 focus:ring-4 focus:ring-[#7c3aed]/30 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Entrar"}
                                        </button>
                                    </Form>
                                )}
                            </Formik>

                            <div className="relative z-10 mt-4 sm:mt-5 text-center text-xs sm:text-sm text-white/70">
                                Não tem uma conta?{" "}
                                <Link href="/register" className="font-semibold text-[#22d3ee] hover:text-white transition-colors">
                                    Cadastre-se
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
