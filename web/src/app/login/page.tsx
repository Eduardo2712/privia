"use client";

import Link from "next/link";
import { Formik, Form } from "formik";
import { validationLogin } from "../../utils/validations";
import { Mail, MessageSquare, Smartphone, Lock, Zap, Smile, Star, Globe, Unlock } from "lucide-react";
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
                <div className="text-center lg:text-left space-y-6 sm:space-y-8">
                    <div className="space-y-3 sm:space-y-4">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            Organize sua vida com{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">simplicidade</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                            Gerencie emails, mensagens e tarefas em um só lugar. Transforme o caos digital em produtividade organizada.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <Mail className="h-5 w-5 text-blue-600" />
                            </div>

                            <span className="text-sm sm:text-base text-gray-700">Gestão de Emails</span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                <MessageSquare className="h-5 w-5 text-green-600" />
                            </div>

                            <span className="text-sm sm:text-base text-gray-700">Chat Inteligente</span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                <Smartphone className="h-5 w-5 text-purple-600" />
                            </div>

                            <span className="text-sm sm:text-base text-gray-700">Mobile First</span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                                <Zap className="h-5 w-5 text-orange-600" />
                            </div>

                            <span className="text-sm sm:text-base text-gray-700">Automação</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center"
                                >
                                    <Smile className="h-4 w-4 text-white" />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />

                                <span className="font-semibold">5.0</span>

                                <span className="hidden xs:inline">• +1.000 usuários satisfeitos</span>

                                <span className="xs:hidden">• +1k usuários</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-md mx-auto lg:mx-0">
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                        <div className="text-center mb-6 sm:mb-8">
                            <div className="flex items-center justify-center mb-3 sm:mb-4">
                                <div className="p-2.5 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                                    <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                </div>
                            </div>

                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Bem-vindo de volta!</h2>

                            <p className="text-sm sm:text-base text-gray-600 mt-2">Entre na sua conta para continuar</p>
                        </div>

                        <Formik initialValues={initialValues} validationSchema={validationLogin} onSubmit={onSubmit}>
                            {({ isSubmitting }) => (
                                <Form className="space-y-4 sm:space-y-6">
                                    <CustomInput label="Email" name="email" type="email" placeholder="seu@email.com" IconLeft={Mail} required />

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

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                        <div className="flex items-center">
                                            <input
                                                id="remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />

                                            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                                                Lembrar de mim
                                            </label>
                                        </div>

                                        <Link
                                            href="/forgot-password"
                                            className="text-sm text-blue-600 hover:text-blue-500 transition-colors text-center sm:text-right"
                                        >
                                            Esqueceu a senha?
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                    >
                                        {isSubmitting ? "Entrando..." : "Entrar"}
                                    </button>
                                </Form>
                            )}
                        </Formik>

                        <div className="mt-4 sm:mt-6 text-center">
                            <p className="text-sm sm:text-base text-gray-600">
                                Não tem uma conta?{" "}
                                <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                                    Cadastre-se
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
