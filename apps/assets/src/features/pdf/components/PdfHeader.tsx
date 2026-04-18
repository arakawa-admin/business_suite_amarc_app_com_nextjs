import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    wrap: {
        marginBottom: 12,
    },
    heading: {
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 6,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#cccccc",
    },
});

export function PdfHeader({ title }: { title: string }) {
    return (
        <View style={styles.wrap}>
            <Text style={styles.heading}>{title}</Text>
        </View>
    );
}
