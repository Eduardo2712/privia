"use client";

import { useEffect, useState } from "react";
import { useRequest } from "../../hooks/use-request.hook";
import { list } from "../../requests/file.request";
import { list as listMessages } from "../../requests/message.request";
import InboxHeader from "../../components/inbox/InboxHeader";
import InboxLateralList from "../../components/inbox/InboxLateralList";
import { components } from "../../types/api-types";
import InboxFileBox from "../../components/inbox/InboxFileBox";
import { useAlert } from "../../hooks/use-alert.hook";
import { formatErrorMessage } from "../../utils/functions";
import Loading from "../../components/Loading";
import { AxiosRequestConfig } from "axios";

export default function HomePage() {
    const [files, setFiles] = useState<components["schemas"]["ListFileResponseDto"]>({
        items: [],
        page: 1,
        totalItems: 0,
        totalPages: 1,
    });
    const [messages, setMessages] = useState<Record<string, components["schemas"]["ListMessageResponseDto"]>>({});
    const [fileSelected, setFileSelected] = useState<components["schemas"]["FileResponseDto"] | null>(null);

    const alert = useAlert();

    const { execute, loading } = useRequest<components["schemas"]["ListFileResponseDto"]>({
        request: () => list({ page: files.page }),
        onSuccess: (data) => setFiles(data),
        onError: (err) => alert.error(formatErrorMessage(err.response?.data)),
    });

    const { execute: executeListMessage, loading: loadingMessages } = useRequest<components["schemas"]["ListMessageResponseDto"]>({
        request: (config?: AxiosRequestConfig) => listMessages({ fileId: config?.data?.fileId, page: 1 }),
        onError: (err) => alert.error(formatErrorMessage(err.response?.data)),
    });

    const fetchList = async (page: number) => {
        setFiles((prev) => ({ ...prev, page }));

        await execute();
    };

    const handleFileSelected = async (file: components["schemas"]["FileResponseDto"]) => {
        setFileSelected(file);

        if (messages[file.id]) {
            return;
        }

        const data = await executeListMessage({ data: { fileId: file.id } });

        if (data) {
            setMessages((prev) => ({ ...prev, [file.id]: data }));
        }
    };

    useEffect(() => {
        fetchList(files.page);
    }, [files.page]);

    return (
        <div className="h-screen bg-linear-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] text-white flex flex-col overflow-hidden">
            <InboxHeader />

            <Loading isLoading={loading && files.page === 1}>
                <div className="flex flex-row flex-1 overflow-hidden gap-0">
                    <InboxLateralList
                        files={files}
                        setFiles={setFiles}
                        setFileSelected={setFileSelected}
                        fileSelected={fileSelected}
                        handleFileSelected={handleFileSelected}
                    />

                    <Loading isLoading={loadingMessages}>
                        <InboxFileBox
                            fileSelected={fileSelected}
                            setFiles={setFiles}
                            setFileSelected={setFileSelected}
                            messages={messages}
                            setMessages={setMessages}
                        />
                    </Loading>
                </div>
            </Loading>
        </div>
    );
}
