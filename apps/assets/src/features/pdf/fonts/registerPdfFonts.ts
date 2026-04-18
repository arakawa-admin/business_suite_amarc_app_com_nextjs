import path from "path";
import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerPdfFonts() {
    if (registered) return;

    const regularPath = path.join(
        process.cwd(),
        "public",
        "fonts",
        "NotoSansJP-Regular.ttf",
    );
    const boldPath = path.join(
        process.cwd(),
        "public",
        "fonts",
        "NotoSansJP-Bold.ttf",
    );

    Font.register({
        family: "NotoSansJP",
        fonts: [
            {
                src: regularPath,
                fontWeight: 400,
            },
            {
                src: boldPath,
                fontWeight: 700,
            },
        ],
    });
    registered = true;
}
