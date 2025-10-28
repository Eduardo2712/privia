"use client";

import { Formik, Form } from "formik";
import { validationRegister } from "../../utils/validations";
import { CustomInput } from "../../components/CustomInput";
import { Mail, Phone, User, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { formatErrorMessage, formatPhone } from "../../utils/functions";
import { useRouter } from "next/navigation";
import { create } from "../../requests/user.request";
import toast from "react-hot-toast";
import axios from "axios";
import Link from "next/link";

export default function Page() {
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    const initialValues = {
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
    };

    const onSubmit = async (values: typeof initialValues) => {
        try {
            const response = await create(values);

            if (response.status !== 201) {
                return toast.error("Falha ao criar conta. Tente novamente.");
            }

            toast.success("Conta criada com sucesso!");

            router.push("/login");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(formatErrorMessage(error.response?.data?.message));
            } else {
                toast.error("Ocorreu um erro inesperado");
            }
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-200/50 blur-3xl" />

                <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14 md:py-20">
                <div className="grid items-center gap-10 xl:grid-cols-2">
                    <div className="text-center xl:text-left">
                        <h1 className="mb-4 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
                            Crie sua{" "}
                            <span className="mx-2 inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                conta
                            </span>{" "}
                            agora
                        </h1>

                        <p className="mx-auto max-w-md text-base text-slate-600 sm:text-lg">
                            Leva menos de um minuto. Você terá acesso ao seu painel, fluxo de mensagens e notificações por e-mail.
                        </p>

                        <div className="mt-6 hidden gap-3 text-sm text-slate-600 sm:flex sm:justify-center">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 ring-1 ring-slate-200">
                                🛡️ Segurança de ponta
                            </span>

                            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 ring-1 ring-slate-200">
                                ⚡ Rápido e simples
                            </span>

                            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 ring-1 ring-slate-200">
                                ✉️ Suporte por e-mail
                            </span>
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
                        <div className="mb-6 flex flex-col items-start justify-between xl:flex-row gap-3">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Vamos começar</h2>

                                <p className="mt-1 text-sm text-slate-600">Preencha seus dados para criar sua conta.</p>
                            </div>

                            <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                Já tem uma conta?
                            </Link>
                        </div>

                        <Formik initialValues={initialValues} validationSchema={validationRegister} onSubmit={onSubmit}>
                            {({ isSubmitting, setFieldValue }) => (
                                <Form className="space-y-4 sm:space-y-6">
                                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                                        <CustomInput label="Nome" name="name" type="text" placeholder="seu nome" IconLeft={User} required />

                                        <CustomInput
                                            label="Telefone"
                                            name="phone"
                                            type="text"
                                            placeholder="seu telefone"
                                            IconLeft={Phone}
                                            onChange={(e) => setFieldValue("phone", formatPhone(e.target.value))}
                                            maxLength={15}
                                            required
                                        />
                                    </div>

                                    <CustomInput label="E-mail" name="email" type="email" placeholder="seu e-mail" IconLeft={Mail} required />

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
                                                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-1 py-1 rounded-sm"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                />
                                            ) : (
                                                <Lock
                                                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-1 py-1 rounded-sm"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                />
                                            )
                                        }
                                        required
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
                                                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-1 py-1 rounded-sm"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                />
                                            ) : (
                                                <Lock
                                                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-1 py-1 rounded-sm"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                />
                                            )
                                        }
                                        required
                                    />

                                    <div className="text-xs text-slate-500 flex flex-row justify-start items-start">
                                        <p className="hidden xl:block">Ao criar uma conta, você concorda com os nossos</p>

                                        <button
                                            type="button"
                                            className="ml-1 underline decoration-slate-300 underline-offset-2 hover:text-slate-700"
                                            onClick={() => toast("Termos de uso em breve.")}
                                        >
                                            Termos e Política de Privacidade
                                        </button>
                                    </div>

                                    <div className="mt-2 flex gap-3 flex-col-reverse sm:flex-row">
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            className="w-full rounded-xl bg-white px-8 py-4 text-lg font-medium text-slate-700 ring-1 ring-slate-300 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                                            onClick={() => router.push("/")}
                                        >
                                            Voltar
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-80"
                                        >
                                            {isSubmitting && (
                                                <svg
                                                    className="mr-2 h-5 w-5 animate-spin text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                </svg>
                                            )}
                                            {isSubmitting ? "Criando..." : "Criar Conta"}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>

                        <p className="mt-6 text-center text-sm text-slate-600">
                            Já é cadastrado?{" "}
                            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
                                Entre aqui
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
