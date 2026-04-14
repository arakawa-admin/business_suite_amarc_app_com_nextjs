export function resolveMasterRepositoryErrorMessage(
    error: unknown,
    defaultMessage: string,
): string {
    if (!(error instanceof Error)) {
        return defaultMessage;
    }

    const message = error.message;

    if (
        message.includes("duplicate key value violates unique constraint") ||
        message.includes("23505")
    ) {
        return "コードが重複しています";
    }

    return message || defaultMessage;
}
