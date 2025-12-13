"use client";

import { useEffect, useState } from "react";
import { useRequest } from "../../hooks/use-request.hook";
import { list } from "../../requests/file.request";
import toast from "react-hot-toast";
import InboxHeader from "../../components/InboxHeader";
import InboxLateralList from "../../components/InboxLateralList";
import { components } from "../../types/api-types";
import InboxFileBox from "../../components/InboxFileBox";

export default function HomePage() {
    const [listFiles, setListFiles] = useState<components["schemas"]["ListFileResponseDto"]["items"]>([]);
    const [fileSelected, setFileSelected] = useState<components["schemas"]["FileResponseDto"] | null>(null);
    const [listPage, setListPage] = useState<number>(1);

    const { execute: executeList } = useRequest<components["schemas"]["ListFileResponseDto"]>({
        request: () => list({ page: listPage }),
        onSuccess: (data) => {
            setListFiles(data.items);
        },
        onError: () => toast.error("Erro ao listar arquivos."),
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
                <InboxLateralList listFiles={listFiles} setFileSelected={setFileSelected} fileSelected={fileSelected} />

                <InboxFileBox fileSelected={fileSelected} setListFiles={setListFiles} setFileSelected={setFileSelected} />
            </div>
        </div>
    );
}
