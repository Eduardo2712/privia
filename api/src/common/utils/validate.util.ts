export const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
export const cepRegex = /^\d{5}-\d{3}$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,30}$/;
export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function isValidCpf(cpf: string): boolean {
    cpf = cpf.replaceAll(/[^\d]/g, "");

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }

    let sum = 0;

    for (let i = 0; i < 9; i++) {
        sum += Number.parseInt(cpf.charAt(i)) * (10 - i);
    }

    let firstDigit = (sum * 10) % 11;

    if (firstDigit === 10 || firstDigit === 11) {
        firstDigit = 0;
    }

    if (firstDigit !== Number.parseInt(cpf.charAt(9))) {
        return false;
    }

    sum = 0;

    for (let i = 0; i < 10; i++) {
        sum += Number.parseInt(cpf.charAt(i)) * (11 - i);
    }

    let secondDigit = (sum * 10) % 11;

    if (secondDigit === 10 || secondDigit === 11) {
        secondDigit = 0;
    }

    if (secondDigit !== Number.parseInt(cpf.charAt(10))) {
        return false;
    }

    return true;
}

export function isValidListEmails(text: string): boolean {
    const emails = text.split(",").map((email) => email.trim());

    return emails.every((email) => emailRegex.test(email));
}

