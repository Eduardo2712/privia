interface Props {
    readonly progress: number | null;
}

export default function ProgressBar({ progress }: Props) {
    return (
        <>
            {progress !== null && progress < 100 && (
                <div className="w-full bg-white/10 rounded-full h-2.5 mt-2">
                    <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            )}
        </>
    );
}
