import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { ja } from "date-fns/locale";

// 年 or 年月 or 年月日から日付文字列を生成
// params: yyyy, yyyy-MM, yyyy-MM-dd
// return:
//      YEAR:   {from: 2025-01-01, to: 2025-12-31}
//      MONTH:  {from: 2025-01-01, to: 2025-01-31}
//      DAY:    {from: 2025-01-01, to: 2025-01-01}
export function generateDateStringFromAndTo(
    dateString: string
): {
    from: string,
    to: string
} {
    let fromString = "";
    let toString = "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // 日次
        fromString = format(new Date(dateString), "yyyy-MM-dd", { locale: ja });
        toString = format(new Date(dateString), "yyyy-MM-dd", { locale: ja });

    } else if (/^\d{4}-\d{2}$/.test(dateString)) {
        // 月次
        const d = new Date(dateString + "-01T00:00:00"); // "2025-10" → "2025-10-01"
        fromString = format(startOfMonth(d), "yyyy-MM-dd", { locale: ja });
        toString = format(endOfMonth(d), "yyyy-MM-dd", { locale: ja });

    } else if (/^\d{4}$/.test(dateString)) {
        // 年次
        const d = new Date(dateString + "-01-01T00:00:00"); // "2025" → "2025-01-01"
        fromString = format(startOfYear(d), "yyyy-MM-dd", { locale: ja });
        toString = format(endOfYear(d), "yyyy-MM-dd", { locale: ja });
    }

    return {
        from: fromString,
        to: toString
    }
}
