import { LoaderCircle } from "lucide-react";

interface Props {
    readonly isLoading: boolean;
    readonly children?: React.ReactNode;
}

export default function Loading({ isLoading, children }: Props) {
    if (!isLoading) {
        return children;
    }

    return (
        <div className="flex items-center justify-center flex-1">
            <LoaderCircle className="animate-spin h-8 w-8 text-indigo-600 xl:h-10 xl:w-10" />
        </div>
    );
}
