import { useState, useCallback } from "react";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

interface UseRequestOptions<TData = unknown, TError = unknown> {
    request?: (config?: AxiosRequestConfig) => Promise<AxiosResponse<TData>>;
    onSuccess?: (data: TData) => void;
    onError?: (error: AxiosError<TError>) => void;
    onFinally?: () => void;
}

interface UseRequestReturn<TData = unknown, TError = unknown> {
    data: TData | null;
    error: AxiosError<TError> | null;
    loading: boolean;
    execute: (config?: AxiosRequestConfig) => Promise<TData | undefined>;
}

export function useRequest<TData = unknown, TError = unknown>(options: UseRequestOptions<TData, TError>): UseRequestReturn<TData, TError> {
    const [data, setData] = useState<TData | null>(null);
    const [error, setError] = useState<AxiosError<TError> | null>(null);
    const [loading, setLoading] = useState(false);

    const execute = useCallback(
        async (config?: AxiosRequestConfig): Promise<TData | undefined> => {
            try {
                setLoading(true);
                setError(null);

                const response = options.request ? await options.request(config) : await axios<TData>(config || {});

                setData(response.data);
                options.onSuccess?.(response.data);

                return response.data;
            } catch (err) {
                const axiosError = err as AxiosError<TError>;

                setError(axiosError);
                options.onError?.(axiosError);

                return undefined;
            } finally {
                options.onFinally?.();

                setLoading(false);
            }
        },
        [options]
    );

    return { data, error, loading, execute };
}
