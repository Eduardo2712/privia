"use client";

import { Formik, Form } from "formik";
import { validationRegister } from "../../utils/validations";
import { CustomInput } from "../../components/CustomInput";
import { Mail, Phone, User, Lock, Unlock, Loader2 } from "lucide-react";
import { useState } from "react";
import { formatErrorMessage, formatPhone } from "../../utils/functions";
import { useRouter } from "next/navigation";
import { create } from "../../requests/user.request";
import { AxiosRequestConfig } from "axios";
import Link from "next/link";
import { useAlert } from "../../hooks/use-alert.hook";
import { useRequest } from "../../hooks/use-request.hook";

export default function Page() {
    const [showPassword, setShowPassword] = useState(false);

    const alert = useAlert();

    const router = useRouter();

    const { execute } = useRequest({
        request: (config?: AxiosRequestConfig) => create(config?.data as typeof initialValues),
        onSuccess: () => {
            alert.success("Conta criada com sucesso! Realize o login para continuar.");

            router.push("/login");
        },
        onError: (err) => alert.error(formatErrorMessage(err.response?.data)),
    });

    const initialValues = {
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
    };

    const onSubmit = async (values: typeof initialValues) => {
        await execute({ data: values });
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#0f0f0f] via-[#0d1117] to-[#0b0f1a] text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#7c3aed]/25 blur-3xl" />

                <div className="absolute -bottom-10 -left-20 h-80 w-80 rounded-full bg-[#22d3ee]/20 blur-3xl" />

                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.16),transparent_38%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.12),transparent_30%)]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 md:py-16 lg:py-20">
                <div className="grid items-center gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-2">
                    <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70 ring-1 ring-white/10 backdrop-blur">
                            <span className="h-2 w-2 rounded-full bg-[#22d3ee]" /> Cadastro protegido por design
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">
                            Crie sua{" "}
                            <span className="mx-1 sm:mx-2 bg-linear-to-r from-[#7c3aed] to-[#22d3ee] bg-clip-text text-transparent">conta</span> em
                            minutos
                        </h1>

                        <p className="mx-auto max-w-xl text-sm sm:text-base md:text-lg text-white/70">
                            Experiência alinhada à caixa de entrada: contraste alto, foco na leitura e interações rápidas para você começar a usar o
                            chat de arquivos.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm text-white/80">
                            <div className="flex items-center gap-2 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-2 sm:px-3 py-2 backdrop-blur">
                                <span className="text-[#22d3ee] text-base">🛡️</span>
                                <span>Seguro</span>
                            </div>

                            <div className="flex items-center gap-2 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-2 sm:px-3 py-2 backdrop-blur">
                                <span className="text-[#7c3aed] text-base">⚡</span>
                                <span>Rápido e simples</span>
                            </div>

                            <div className="flex items-center gap-2 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-2 sm:px-3 py-2 backdrop-blur">
                                <span className="text-[#22d3ee] text-base">✉️</span>
                                <span>Suporte 24/7</span>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-sm sm:max-w-md lg:max-w-xl">
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur sm:p-6 lg:p-8">
                            <div className="pointer-events-none absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_15%_15%,rgba(124,58,237,0.25),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(34,211,238,0.2),transparent_38%)]" />

                            <div className="relative z-10 mb-4 sm:mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white">Vamos começar</h2>

                                    <p className="mt-1 text-xs sm:text-sm text-white/70">Preencha seus dados para criar sua conta.</p>
                                </div>

                                <Link
                                    href="/login"
                                    className="text-xs sm:text-sm font-semibold text-[#22d3ee] hover:text-white transition-colors whitespace-nowrap"
                                >
                                    Já tem uma conta?
                                </Link>
                            </div>

                            <Formik initialValues={initialValues} validationSchema={validationRegister} onSubmit={onSubmit}>
                                {({ isSubmitting, setFieldValue }) => (
                                    <Form className="relative z-10 space-y-3 sm:space-y-4">
                                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                                            <CustomInput
                                                label="Nome"
                                                name="name"
                                                type="text"
                                                placeholder="seu nome"
                                                IconLeft={User}
                                                required
                                                labelClassName="text-white text-sm sm:text-base"
                                                inputClassName="bg-white/5 border-white/10 text-white placeholder-white/40 focus:ring-[#22d3ee] focus:border-transparent text-sm sm:text-base py-2 sm:py-3"
                                            />

                                            <CustomInput
                                                label="Telefone"
                                                name="phone"
                                                type="text"
                                                placeholder="seu telefone"
                                                IconLeft={Phone}
                                                onChange={(e) => setFieldValue("phone", formatPhone(e.target.value))}
                                                maxLength={15}
                                                required
                                                labelClassName="text-white text-sm sm:text-base"
                                                inputClassName="bg-white/5 border-white/10 text-white placeholder-white/40 focus:ring-[#22d3ee] focus:border-transparent text-sm sm:text-base py-2 sm:py-3"
                                            />
                                        </div>

                                        <CustomInput
                                            label="E-mail"
                                            name="email"
                                            type="email"
                                            placeholder="seu e-mail"
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

                                        <CustomInput
                                            label="Confirmar Senha"
                                            name="confirmPassword"
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

                                        <div className="flex flex-col gap-2 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="hidden lg:block">Ao criar uma conta, você concorda com os nossos</p>

                                            <button
                                                type="button"
                                                className="text-[#22d3ee] underline decoration-white/30 underline-offset-2 hover:text-white text-left"
                                                onClick={() => alert.info("Termos de uso em breve.")}
                                            >
                                                Termos e Política de Privacidade
                                            </button>
                                        </div>

                                        <div className="mt-2 sm:mt-3 flex flex-col-reverse gap-2 sm:gap-3 sm:flex-row">
                                            <button
                                                type="button"
                                                disabled={isSubmitting}
                                                className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium text-white backdrop-blur transition hover:bg-white/10 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-70"
                                                onClick={() => router.push("/")}
                                            >
                                                Voltar
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full inline-flex items-center justify-center rounded-lg sm:rounded-xl bg-linear-to-r from-[#7c3aed] to-[#22d3ee] px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-[#22d3ee]/30 transition hover:shadow-[#7c3aed]/30 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Criar Conta"}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>

                            <p className="relative z-10 mt-4 sm:mt-6 text-center text-xs sm:text-sm text-white/70">
                                Já é cadastrado?{" "}
                                <Link href="/login" className="font-semibold text-[#22d3ee] hover:text-white transition-colors">
                                    Entre aqui
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
