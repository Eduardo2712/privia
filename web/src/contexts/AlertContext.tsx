"use client";

import React, { createContext, useState, useCallback, useMemo, ReactNode } from "react";

export type AlertType = "success" | "error" | "warning" | "info" | "question";

export interface AlertButton {
    text: string;
    onClick?: () => void;
    className?: string;
    variant?: "primary" | "secondary" | "danger";
}

export interface AlertOptions {
    title?: string;
    message: string;
    type?: AlertType;
    confirmButtonText?: string;
    cancelButtonText?: string;
    showCancelButton?: boolean;
    showConfirmButton?: boolean;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
    buttons?: AlertButton[];
    duration?: number;
    closable?: boolean;
}

interface AlertState extends AlertOptions {
    isOpen: boolean;
    id: string;
}

interface AlertContextType {
    success: (message: string, options?: Partial<AlertOptions>) => void;
    error: (message: string, options?: Partial<AlertOptions>) => void;
    warning: (message: string, options?: Partial<AlertOptions>) => void;
    info: (message: string, options?: Partial<AlertOptions>) => void;
    confirm: (message: string, options?: Partial<AlertOptions>) => Promise<boolean>;
    custom: (options: AlertOptions) => void;
    close: () => void;
}

export const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alert, setAlert] = useState<AlertState | null>(null);
    const [confirmResolve, setConfirmResolve] = useState<((value: boolean) => void) | null>(null);

    const close = useCallback(() => {
        setAlert(null);
        if (confirmResolve) {
            confirmResolve(false);
            setConfirmResolve(null);
        }
    }, [confirmResolve]);

    const showAlert = useCallback(
        (options: AlertOptions) => {
            const id = Math.random().toString(36).substring(7);
            setAlert({
                ...options,
                isOpen: true,
                id,
                closable: options.closable ?? true,
                showConfirmButton: options.showConfirmButton ?? true,
            });

            if (options.duration) {
                setTimeout(() => {
                    close();
                }, options.duration);
            }
        },
        [close]
    );

    const success = useCallback(
        (message: string, options?: Partial<AlertOptions>) => {
            showAlert({
                message,
                type: "success",
                confirmButtonText: "OK",
                showCancelButton: false,
                ...options,
            });
        },
        [showAlert]
    );

    const error = useCallback(
        (message: string, options?: Partial<AlertOptions>) => {
            showAlert({
                message,
                type: "error",
                confirmButtonText: "OK",
                showCancelButton: false,
                ...options,
            });
        },
        [showAlert]
    );

    const warning = useCallback(
        (message: string, options?: Partial<AlertOptions>) => {
            showAlert({
                message,
                type: "warning",
                confirmButtonText: "OK",
                showCancelButton: false,
                ...options,
            });
        },
        [showAlert]
    );

    const info = useCallback(
        (message: string, options?: Partial<AlertOptions>) => {
            showAlert({
                message,
                type: "info",
                confirmButtonText: "OK",
                showCancelButton: false,
                ...options,
            });
        },
        [showAlert]
    );

    const confirm = useCallback(
        (message: string, options?: Partial<AlertOptions>): Promise<boolean> => {
            return new Promise((resolve) => {
                setConfirmResolve(() => resolve);
                showAlert({
                    message,
                    type: "question",
                    confirmButtonText: "Confirmar",
                    cancelButtonText: "Cancelar",
                    showCancelButton: true,
                    ...options,
                });
            });
        },
        [showAlert]
    );

    const custom = useCallback(
        (options: AlertOptions) => {
            showAlert(options);
        },
        [showAlert]
    );

    const handleConfirm = async () => {
        if (alert?.onConfirm) {
            await alert.onConfirm();
        }
        if (confirmResolve) {
            confirmResolve(true);
            setConfirmResolve(null);
        }
        close();
    };

    const handleCancel = () => {
        if (alert?.onCancel) {
            alert.onCancel();
        }
        if (confirmResolve) {
            confirmResolve(false);
            setConfirmResolve(null);
        }
        close();
    };

    const contextValue = useMemo(
        () => ({ success, error, warning, info, confirm, custom, close }),
        [success, error, warning, info, confirm, custom, close]
    );

    return (
        <AlertContext.Provider value={contextValue}>
            {children}
            {alert?.isOpen && <AlertModal alert={alert} onConfirm={handleConfirm} onCancel={handleCancel} onClose={close} />}
        </AlertContext.Provider>
    );
};

interface AlertModalProps {
    alert: AlertState;
    onConfirm: () => void;
    onCancel: () => void;
    onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ alert, onConfirm, onCancel, onClose }) => {
    const getIcon = () => {
        switch (alert.type) {
            case "success":
                return (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <svg
                            className="h-6 w-6 text-green-600 dark:text-green-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                );
            case "error":
                return (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                        <svg
                            className="h-6 w-6 text-red-600 dark:text-red-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            case "warning":
                return (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                        <svg
                            className="h-6 w-6 text-yellow-600 dark:text-yellow-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                            />
                        </svg>
                    </div>
                );
            case "info":
                return (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <svg
                            className="h-6 w-6 text-blue-600 dark:text-blue-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                            />
                        </svg>
                    </div>
                );
            case "question":
                return (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                        <svg
                            className="h-6 w-6 text-indigo-600 dark:text-indigo-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                            />
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    const getButtonVariantClasses = (variant?: "primary" | "secondary" | "danger") => {
        switch (variant) {
            case "primary":
                return "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400";
            case "danger":
                return "bg-red-600 text-white hover:bg-red-500 focus:ring-red-600 dark:bg-red-500 dark:hover:bg-red-400";
            case "secondary":
            default:
                return "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600";
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                {alert.closable ? (
                    <button
                        type="button"
                        aria-label="Close overlay"
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 transition-opacity"
                        onClick={onClose}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                                e.preventDefault();
                                onClose();
                            }
                        }}
                    />
                ) : (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 transition-opacity" />
                )}

                <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div>
                        {alert.closable && (
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        {getIcon()}

                        <div className="mt-3 text-center sm:mt-5">
                            {alert.title && <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">{alert.title}</h3>}
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{alert.message}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`mt-5 sm:mt-6 ${alert.showCancelButton ? "sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3" : ""}`}>
                        {alert.buttons ? (
                            alert.buttons.map((button) => (
                                <button
                                    key={`${button.variant ?? "v"}-${button.className ?? ""}-${button.text}`}
                                    type="button"
                                    className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                        button.className || getButtonVariantClasses(button.variant)
                                    }`}
                                    onClick={() => {
                                        button.onClick?.();
                                        onClose();
                                    }}
                                >
                                    {button.text}
                                </button>
                            ))
                        ) : (
                            <>
                                {alert.showConfirmButton && (
                                    <button
                                        type="button"
                                        className={`inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 ${
                                            alert.showCancelButton ? "sm:col-start-2" : ""
                                        }`}
                                        onClick={onConfirm}
                                    >
                                        {alert.confirmButtonText || "OK"}
                                    </button>
                                )}
                                {alert.showCancelButton && (
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:col-start-1 sm:mt-0"
                                        onClick={onCancel}
                                    >
                                        {alert.cancelButtonText || "Cancelar"}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
