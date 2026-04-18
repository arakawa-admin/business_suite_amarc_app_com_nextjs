export function formatDate(value: string | null | undefined): string {
    if (!value) return "";
    return value.slice(0, 10);
}

export function formatDateTime(value: string | null | undefined): string {
    if (!value) return "";
    const date = new Date(value);

    return new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}
