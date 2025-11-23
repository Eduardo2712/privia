import { CircleCheck } from "lucide-react";
import { components } from "../types/api-types";

interface Props {
    listFiles: components["schemas"]["ListFileResponseDto"]["items"];
    setFileSelected: (file: components["schemas"]["FileResponseDto"]) => void;
    fileSelected: components["schemas"]["FileResponseDto"] | null;
}

export default function InboxLateralList({ listFiles, setFileSelected, fileSelected }: Props) {
    return (
        <aside className="bg-gray-600 text-white p-2 w-full max-w-xs overflow-y-auto h-full">
            <ul className="space-y-1">
                {listFiles.map((file) => (
                    <li key={file.id}>
                        <button
                            className={`w-full border-2 border-gray-500 text-left px-3 py-2 rounded hover:bg-gray-700 flex items-center justify-between ${
                                fileSelected?.id === file.id ? "bg-gray-700 font-semibold" : ""
                            }`}
                            onClick={() => setFileSelected(file)}
                        >
                            {file.name}

                            {fileSelected?.id === file.id && <CircleCheck className="inline-block ml-2 text-green-400" size={16} />}
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
