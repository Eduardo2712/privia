"use client";

import { useRef, useState } from "react";

export default function HomePage() {
    const [file, setFile] = useState<File | null>(null);

    const refButton = useRef<HTMLInputElement>(null);

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center text-black">
            <input
                type="file"
                hidden
                className="file-input file-input-bordered w-full max-w-xs"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                ref={refButton}
                accept=".pdf,.doc,.docx"
            />

            <button className="bg-amber-500 text-black rounded-2xl px-4 py-2 cursor-pointer" onClick={() => refButton.current?.click()}>
                Upload de arquivo
            </button>
        </div>
    );
}
