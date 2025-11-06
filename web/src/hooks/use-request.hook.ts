import { useState, useCallback } from "react";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

interface UseRequestOptions<T> {
    request?: (config?: AxiosRequestConfig) => Promise<{ data: T }>;
    onSuccess?: (data: T) => void;
    onError?: (error: AxiosError) => void;
    onFinally?: () => void;
}

interface UseRequestReturn<T> {
    data: T | null;
    error: AxiosError | null;
    loading: boolean;
    execute: (config?: AxiosRequestConfig) => Promise<void>;
}

export function useRequest<T>(options: UseRequestOptions<T>): UseRequestReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<AxiosError | null>(null);
    const [loading, setLoading] = useState(false);

    const execute = useCallback(
        async (config?: AxiosRequestConfig) => {
            try {
                setLoading(true);
                setError(null);

                const response = options.request ? await options.request(config) : await axios(config || {});

                setData(response.data);
                options.onSuccess?.(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;

                setError(axiosError);
                options.onError?.(axiosError);
            } finally {
                options.onFinally?.();
                setLoading(false);
            }
        },
        [options]
    );

    return { data, error, loading, execute };
}
