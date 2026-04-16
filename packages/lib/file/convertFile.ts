export function blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, {
        type: blob.type,
        lastModified: Date.now()
    });
}

export function normalizeFile(input: File | Blob): File {
    if (input instanceof File) return input;

    // Blob → File の場合、適当な名前をつける
    const ext = input.type.split("/")[1] ?? "dat";
    return blobToFile(input, `blob_${Date.now()}.${ext}`);
}
