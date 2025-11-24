import { CircleCheck, FileUp } from "lucide-react";
import { components } from "../types/api-types";

interface Props {
    listFiles: components["schemas"]["ListFileResponseDto"]["items"];
    setFileSelected: (file: components["schemas"]["FileResponseDto"]) => void;
    fileSelected: components["schemas"]["FileResponseDto"] | null;
}

export default function InboxLateralList({ listFiles, setFileSelected, fileSelected }: Props) {
    return (
        <aside className="bg-gray-600 text-white w-full max-w-xs h-full flex-col flex justify-between px-2">
            <div className="max-w-xs overflow-y-auto flex-1">
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
            </div>

            <button
                type="button"
                className="w-full border-none text-left px-3 py-2 rounded hover:bg-green-600 flex items-center justify-center mt-4 mb-4 bg-green-500 text-sm text-white font-semibold"
            >
                <FileUp className="inline-block mr-2" size={20} />
                Enviar arquivo
            </button>
        </aside>
    );
}
