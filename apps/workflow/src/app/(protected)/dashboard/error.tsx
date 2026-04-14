"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-xl text-red-600">エラーが発生しました</h2>
            <p className="text-sm mt-2">{error.message}</p>
            <button
                onClick={reset}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                再試行
            </button>
        </div>
    );
}
