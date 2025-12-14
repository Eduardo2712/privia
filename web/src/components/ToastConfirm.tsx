import toast, { ToastOptions } from "react-hot-toast";
import { ReactNode } from "react";

interface ToastConfirmOptions {
    message: ReactNode;
    onYes?: () => void;
    onNo?: () => void;
    labelYes?: string;
    labelNo?: string;
    classYes?: string;
    classNo?: string;
    classContainer?: string;
    toastOptions?: ToastOptions;
}

export const ToastConfirm = ({
    message,
    onYes = () => {},
    onNo = () => {},
    labelYes = "Yes",
    labelNo = "No",
    classYes = "rounded bg-blue-600 flex-1 h-8 flex justify-center items-center p-2 text-white",
    classNo = "rounded bg-red-600 flex-1 h-8 flex justify-center items-center p-2 text-white",
    classContainer = "flex flex-col gap-6",
    toastOptions = { duration: Infinity, position: "top-center" },
}: ToastConfirmOptions) => {
    toast(
        (t) => (
            <div className={classContainer}>
                <div className="text-lg">{message}</div>

                <div className="flex gap-2 mt-3">
                    <button
                        className={classNo}
                        type="button"
                        onClick={() => {
                            onNo();
                            toast.dismiss(t.id);
                        }}
                    >
                        {labelNo}
                    </button>

                    <button
                        className={classYes}
                        type="button"
                        onClick={() => {
                            onYes();
                            toast.dismiss(t.id);
                        }}
                    >
                        {labelYes}
                    </button>
                </div>
            </div>
        ),
        toastOptions
    );
};
