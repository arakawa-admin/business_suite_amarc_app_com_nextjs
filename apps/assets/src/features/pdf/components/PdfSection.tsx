import React from "react";
import { View, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "./PdfHeader";

const styles = StyleSheet.create({
    section: {
        marginBottom: 14,
    },
});

export function PdfSection({
    title,
    children,
    avoidBreak = false,
    breakBefore = false,
}: {
    title?: string;
    children: React.ReactNode;
    avoidBreak?: boolean;
    breakBefore?: boolean;
}) {
    return (
        <View
            style={styles.section}
            wrap={!avoidBreak}
            break={breakBefore}
        >
            {title ? <PdfHeader title={title} /> : null}
            {children}
        </View>
    );
}
