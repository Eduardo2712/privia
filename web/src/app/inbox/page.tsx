"use client";

import { useEffect, useState } from "react";
import { useRequest } from "../../hooks/use-request.hook";
import { list } from "../../requests/file.request";
import InboxHeader from "../../components/inbox/InboxHeader";
import InboxLateralList from "../../components/inbox/InboxLateralList";
import { components } from "../../types/api-types";
import InboxFileBox from "../../components/inbox/InboxFileBox";
import { useAlert } from "../../hooks/use-alert.hook";
import { formatErrorMessage } from "../../utils/functions";
import Loading from "../../components/Loading";

export default function HomePage() {
    const [files, setFiles] = useState<components["schemas"]["ListFileResponseDto"]>({
        items: [],
        page: 1,
        totalItems: 0,
        totalPages: 1,
    });
    const [fileSelected, setFileSelected] = useState<components["schemas"]["FileResponseDto"] | null>(null);

    const alert = useAlert();

    const { execute, loading } = useRequest<components["schemas"]["ListFileResponseDto"]>({
        request: () => list({ page: files.page }),
        onSuccess: (data) => setFiles(data),
        onError: (err) => alert.error(formatErrorMessage(err.response?.data)),
    });

    const fetchList = async (page: number) => {
        setFiles((prev) => ({ ...prev, page }));

        await execute();
    };

    useEffect(() => {
        fetchList(files.page);
    }, [files.page]);

    return (
        <div className="h-screen bg-linear-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] text-white flex flex-col overflow-hidden">
            <InboxHeader />

            <Loading isLoading={loading && files.page === 1}>
                <div className="flex flex-row flex-1 overflow-hidden gap-0">
                    <InboxLateralList files={files} setFiles={setFiles} setFileSelected={setFileSelected} fileSelected={fileSelected} />

                    <InboxFileBox fileSelected={fileSelected} setFiles={setFiles} setFileSelected={setFileSelected} />
                </div>
            </Loading>
        </div>
    );
}
