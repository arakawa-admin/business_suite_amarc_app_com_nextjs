import React from "react";
import { Text, StyleSheet } from "@react-pdf/renderer";
import { PdfBaseDocument } from "../components/PdfBaseDocument";
import { PdfKeyValueTable } from "../components/PdfKeyValueTable";
import { PdfSection } from "../components/PdfSection";

const styles = StyleSheet.create({
    section: {
        marginBottom: 14,
    },
    noteBox: {
        borderWidth: 1,
        borderColor: "#d9d9d9",
        padding: 10,
        minHeight: 60,
        fontSize: 10,
    },
});

export function DetailPdfDocument({
    title,
    subTitle,
    sections,
    noteTitle,
    note,
}: {
    title: string;
    subTitle?: string;
    sections: {
        title: string;
        rows: { label: string; value: string }[];
    }[];
    noteTitle?: string;
    note?: string;
}) {
    return (
        <PdfBaseDocument title={title} subTitle={subTitle}>
            {sections.map((section, index) => (
                <PdfSection
                    key={`${section.title}-${index}`}
                    title={section.title}
                    avoidBreak
                    >
                    <PdfKeyValueTable rows={section.rows} />
                </PdfSection>
            ))}

            {noteTitle ? (
                <PdfSection title={noteTitle}>
                    <Text style={styles.noteBox}>{note || ""}</Text>
                </PdfSection>
            ) : null}
        </PdfBaseDocument>
    );
}
