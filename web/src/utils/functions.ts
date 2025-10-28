import axios from "axios";

export const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
export const cepRegex = /^\d{5}-\d{3}$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,30}$/;
export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const formatBRL = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

export const formatDecimal = (value: number): string => {
    return formatBRL(value).replace("R$", "");
};

export const cleanMoney = (value: string): string => {
    value = value.replace(/\s/g, "").replace("R$", "");

    value = value.replaceAll(".", "");
    value = value.replaceAll(",", ".");

    return value;
};

export const formatCEP = (value: string): string => {
    value = value
        .replace(/\D/g, "")
        .replace(/(\d{5})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{3})\d+$/, "$1");

    return value;
};

export const formatCPF = (value: string): string => {
    value = value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+$/, "$1");

    return value;
};

export const formatCNPJ = (value: string): string => {
    value = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");

    return value;
};

export const formatMoney = (value: string): string => {
    value = value
        .replace(/\D/g, "")
        .replace(/(\d)(\d{2})$/, "$1,$2")
        .replace(/(?=(\d{3})+(\D))\B/g, ".");

    return value;
};

export const formatPhone = (value: string): string => {
    value = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .replace(/(\d{4})-(\d)(\d{4})/, "$1$2-$3")
        .replace(/(-\d{4})\d+$/, "$1");

    return value;
};

export const formatDate = (value: string): string => {
    value = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\d{4})\d+$/, "$1");

    return value;
};

export const searchCEP = async ({
    cep,
    setCep,
    setAddress,
    setNeighborhood,
    setCity,
    setState,
}: {
    cep: string;
    setCep: (value: string) => void;
    setAddress: (value: string) => void;
    setNeighborhood: (value: string) => void;
    setCity: (value: string) => void;
    setState: (value: string) => void;
}): Promise<void> => {
    const formattedCEP = formatCEP(cep);

    setCep(formattedCEP);

    if (cep.length < 9) {
        return;
    }

    try {
        const response = await axios.get(`https://viacep.com.br/ws/${formattedCEP}/json/`);

        if (response.status === 200) {
            const { logradouro, bairro, localidade, uf } = response.data;

            setAddress(logradouro || "");
            setNeighborhood(bairro || "");
            setCity(localidade || "");
            setState(uf || "");
        } else {
            setAddress("");
            setNeighborhood("");
            setCity("");
            setState("");
        }
    } catch {
        setAddress("");
        setNeighborhood("");
        setCity("");
        setState("");
    }
};

export const addLeadingZero = (value: number): string => {
    return String(value).padStart(2, "0");
};

export const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${addLeadingZero(minutes)}:${addLeadingZero(secs)}`;
};

export const formatErrorMessage = (message: unknown): string => {
    if (Array.isArray(message)) {
        return message.join("\n");
    }

    return typeof message === "string" ? message : "Ocorreu um erro inesperado.";
};
