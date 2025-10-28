import * as Yup from "yup";
import { emailRegex, passwordRegex, phoneRegex } from "./functions";

export const validationLogin = Yup.object({
    email: Yup.string().email("Email inválido").required("Obrigatório"),
    password: Yup.string()
        .min(6, "Mínimo 6 caracteres")
        .max(30, "Máximo 30 caracteres")
        .matches(passwordRegex, "Senha fraca")
        .required("Obrigatório"),
});

export const validationRegister = Yup.object({
    name: Yup.string().max(255, "Máximo 255 caracteres").min(2, "Mínimo 2 caracteres").required("Obrigatório"),
    phone: Yup.string().matches(phoneRegex, "Telefone inválido").required("Obrigatório"),
    email: Yup.string().matches(emailRegex, "Email inválido").required("Obrigatório"),
    password: Yup.string()
        .min(6, "Mínimo 6 caracteres")
        .max(30, "Máximo 30 caracteres")
        .matches(passwordRegex, "Senha fraca")
        .required("Obrigatório"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), undefined], "As senhas não são iguais")
        .required("Obrigatório"),
});
