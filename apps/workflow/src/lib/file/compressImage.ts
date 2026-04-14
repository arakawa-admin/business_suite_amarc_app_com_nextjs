import imageCompression from "browser-image-compression";

export async function compressImage(file: File) {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
    };
    const result = await imageCompression(file, options);
    return new File([result], file.name, { type: result.type });

}
