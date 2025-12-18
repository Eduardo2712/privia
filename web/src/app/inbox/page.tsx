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

export default function HomePage() {
    const [listFiles, setListFiles] = useState<components["schemas"]["ListFileResponseDto"]["items"]>([]);
    const [fileSelected, setFileSelected] = useState<components["schemas"]["FileResponseDto"] | null>(null);
    const [listPage, setListPage] = useState<number>(1);

    const alert = useAlert();

    const { execute: executeList } = useRequest<components["schemas"]["ListFileResponseDto"]>({
        request: () => list({ page: listPage }),
        onSuccess: (data) => {
            setListFiles(data.items);
        },
        onError: (err) => alert.error(formatErrorMessage(err.response?.data)),
    });

    const fetchList = async (page: number) => {
        setListPage(page);

        await executeList();
    };

    useEffect(() => {
        fetchList(listPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listPage]);

    return (
        <div className="h-screen bg-linear-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] text-white flex flex-col overflow-hidden">
            <InboxHeader />

            <div className="flex flex-row flex-1 overflow-hidden gap-0">
                <InboxLateralList listFiles={listFiles} setListFiles={setListFiles} setFileSelected={setFileSelected} fileSelected={fileSelected} />

                <InboxFileBox fileSelected={fileSelected} setListFiles={setListFiles} setFileSelected={setFileSelected} />
            </div>
        </div>
    );
}
