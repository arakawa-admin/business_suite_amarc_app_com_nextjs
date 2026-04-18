import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfBaseDocument } from "../components/PdfBaseDocument";
import { PdfSection } from "../components/PdfSection";

const styles = StyleSheet.create({
    block: {
        borderWidth: 1,
        borderColor: "#d9d9d9",
        padding: 10,
    },
    row: {
        flexDirection: "row",
        marginBottom: 8,
    },
    label: {
        width: "25%",
        fontWeight: 700,
    },
    value: {
        width: "75%",
    },
    approvalRow: {
        flexDirection: "row",
        gap: 8,
    },
    approvalBox: {
        flexGrow: 1,
        minHeight: 70,
        borderWidth: 1,
        borderColor: "#d9d9d9",
        padding: 8,
    },
});

export function FormPdfDocument({
    title,
    subTitle,
    fields,
    body,
    approvalBoxes,
}: {
    title: string;
    subTitle?: string;
    fields: { label: string; value: string }[];
    body?: string;
    approvalBoxes?: string[];
}) {
    return (
        <PdfBaseDocument title={title} subTitle={subTitle}>
            <PdfSection title="基本情報" avoidBreak>
                <View style={styles.block}>
                    {fields.map((field, index) => (
                        <View key={`${field.label}-${index}`} style={styles.row}>
                            <Text style={styles.label}>{field.label}</Text>
                            <Text style={styles.value}>{field.value}</Text>
                        </View>
                    ))}
                </View>
            </PdfSection>

            <PdfSection title="本文">
                <View style={styles.block}>
                    <Text>{body || ""}</Text>
                </View>
            </PdfSection>

            <PdfSection title="承認欄" avoidBreak>
                <View style={styles.approvalRow}>
                    {(approvalBoxes ?? ["申請者", "承認者", "最終承認"]).map((label) => (
                        <View key={label} style={styles.approvalBox}>
                            <Text>{label}</Text>
                        </View>
                    ))}
                </View>
            </PdfSection>
        </PdfBaseDocument>
    );
}
