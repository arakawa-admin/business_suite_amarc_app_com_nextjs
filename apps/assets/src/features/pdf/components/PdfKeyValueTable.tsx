import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    table: {
        display: "flex",
        width: "100%",
        borderWidth: 1,
        borderColor: "#d9d9d9",
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
    },
    key: {
        width: "28%",
        backgroundColor: "#f7f7f7",
        padding: 8,
        fontWeight: 700,
    },
    value: {
        width: "72%",
        padding: 8,
    },
});

export function PdfKeyValueTable({
    rows,
}: {
    rows: { label: string; value: string }[];
}) {
    return (
        <View style={styles.table}>
            {rows.map((row, index) => (
                <View
                    key={`${row.label}-${index}`}
                    style={[
                        styles.row,
                        index === rows.length - 1 ? { borderBottomWidth: 0 } : {},
                    ]}
                >
                    <Text style={styles.key}>{row.label}</Text>
                    <Text style={styles.value}>{row.value}</Text>
                </View>
            ))}
        </View>
    );
}
