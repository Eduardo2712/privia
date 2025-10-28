import React, { forwardRef, ReactNode, InputHTMLAttributes, HTMLInputTypeAttribute } from "react";
import { useField } from "formik";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: ReactNode;
    name: string;
    type?: HTMLInputTypeAttribute;
    IconLeft?: LucideIcon;
    ComponentRight?: ReactNode;
    containerClassName?: string;
    inputClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    hideErrorMessage?: boolean;
    required?: boolean;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
    (
        {
            label,
            name,
            type = "text",
            IconLeft,
            ComponentRight,
            containerClassName,
            inputClassName,
            labelClassName,
            errorClassName,
            hideErrorMessage,
            id,
            required = false,
            ...rest
        },
        ref
    ) => {
        const [field, meta] = useField(name);
        const hasError = meta.touched && !!meta.error;
        const inputId = id || name;
        const errorId = `${inputId}-error`;

        return (
            <div className={clsx("w-full", containerClassName)}>
                <label htmlFor={inputId} className={clsx("block text-sm font-medium text-gray-700 mb-2", labelClassName)}>
                    {label}
                    {required && <span className="text-red-500">{" *"}</span>}
                </label>

                <div className="relative">
                    {IconLeft && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IconLeft className="h-5 w-5 text-gray-400" />
                        </div>
                    )}

                    <input
                        id={inputId}
                        {...field}
                        {...rest}
                        ref={ref}
                        type={type}
                        aria-invalid={hasError || undefined}
                        aria-describedby={hasError ? errorId : undefined}
                        className={clsx(
                            "w-full py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-950 placeholder-gray-400",
                            IconLeft ? "pl-10 pr-4" : "px-4",
                            ComponentRight ? "pr-10" : "",
                            hasError ? "border-red-500 focus:ring-red-400" : "border-gray-300",
                            inputClassName
                        )}
                    />

                    {ComponentRight && <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{ComponentRight}</div>}
                </div>

                {hasError && !hideErrorMessage && (
                    <p id={errorId} className={clsx("text-red-500 text-sm mt-1", errorClassName)}>
                        {meta.error}
                    </p>
                )}
            </div>
        );
    }
);

CustomInput.displayName = "CustomInput";
