import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfBaseDocument } from "../components/PdfBaseDocument";
import { PdfSection } from "../components/PdfSection";

const styles = StyleSheet.create({
    filterText: {
        fontSize: 9,
        color: "#666666",
        marginBottom: 10,
    },
    table: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#d9d9d9",
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
    },
    headerCell: {
        padding: 6,
        backgroundColor: "#f3f3f3",
        fontWeight: 700,
        fontSize: 9,
    },
    cell: {
        padding: 6,
        fontSize: 9,
    },
});

export type ListPdfColumn<T> = {
    key: string;
    label: string;
    width: string;
    render: (row: T) => string;
};

export function ListPdfDocument<T>({
    title,
    subTitle,
    filterSummary,
    rows,
    columns,
}: {
    title: string;
    subTitle?: string;
    filterSummary?: string;
    rows: T[];
    columns: ListPdfColumn<T>[];
}) {
    return (
        <PdfBaseDocument title={title} subTitle={subTitle}>
            <PdfSection title="一覧">
                {filterSummary ? (
                    <Text style={styles.filterText}>条件: {filterSummary}</Text>
                ) : null}

                <View style={styles.table}>
                    <View style={styles.row}>
                        {columns.map((column) => (
                            <Text
                                key={column.key}
                                style={[styles.headerCell, { width: column.width }]}
                            >
                                {column.label}
                            </Text>
                        ))}
                    </View>

                    {rows.map((row, rowIndex) => (
                        <View
                            key={rowIndex}
                            style={[
                                styles.row,
                                rowIndex === rows.length - 1 ? { borderBottomWidth: 0 } : {},
                            ]}
                        >
                            {columns.map((column) => (
                                <Text
                                    key={column.key}
                                    style={[styles.cell, { width: column.width }]}
                                >
                                    {column.render(row)}
                                </Text>
                            ))}
                        </View>
                    ))}
                </View>
            </PdfSection>
        </PdfBaseDocument>
    );
}
