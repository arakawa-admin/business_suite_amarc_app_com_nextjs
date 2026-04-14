import Image from "next/image";
import {
    Box,
    Alert,
    Button,
    Paper,
    Typography,
    Divider,
    Card,
    CardContent,
    Stack,
    Chip
} from "@mui/material";

// --------------------------------------
// 1. Tip / Warning / Danger（Callout 系）
// --------------------------------------

export function Tip({ children }: { children: React.ReactNode }) {
    return (
        <Card
            sx={{
                p: 2,
                mt: 1,
                bgcolor: "blue.50",
                borderLeft: "5px solid #1e40af",
                borderRadius: 1,
            }}
            variant="outlined"
            >
            <Typography fontWeight="bold" mb={1}>
                💡 Tip
            </Typography>
            {children}
        </Card>
    );
}

export function Warning({ children }: { children: React.ReactNode }) {
    return (
        <Card
            sx={{
                p: 2,
                mt: 1,
                bgcolor: "orange.50",
                borderLeft: "5px solid #f59e0b",
                borderRadius: 1,
            }}
            variant="outlined"
        >
            <Typography fontWeight="bold" mb={1}>
                ⚠️ 注意
            </Typography>
            {children}
        </Card>
    );
}

export function Danger({ children }: { children: React.ReactNode }) {
    return (
        <Card
            sx={{
                p: 2,
                mt: 1,
                bgcolor: "red.50",
                borderLeft: "5px solid #ef4444",
                borderRadius: 1,
            }}
            variant="outlined"
            >
            <Typography fontWeight="bold" mb={1}>
                🚨 警告
            </Typography>
            {children}
        </Card>
    );
}

// --------------------------------------
// 2. StepBox（手順を視覚的に強調）
// --------------------------------------

export function StepBox({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Paper sx={{ p: 2 }} variant="outlined">
            <Typography variant="h6" fontWeight="bold">
                {title}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {children}
        </Paper>
    );
}

// --------------------------------------
// 3. InfoCard（解説カード）
// --------------------------------------

export function InfoCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {title}
                </Typography>
                {children}
            </CardContent>
        </Card>
    );
}

// --------------------------------------
// 4. Image（Next.js 最適化対応）
// --------------------------------------

export function MdxImage(props: any) {
    return (
        <Box>
            <Image {...props} alt={props.alt ?? ""} unoptimized />
        </Box>
    );
}

// --------------------------------------
// 5. Button（ヘルプ内で使える）
// --------------------------------------

export function MdxButton({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Button
            variant="contained"
            href={href}
            sx={{ my: 1 }}
        >
            {children}
        </Button>
    );
}

// --------------------------------------
// 6. Stack（レイアウト補助）
// --------------------------------------

export function MdxStack({
    children,
    spacing = 2,
}: {
    children: React.ReactNode;
    spacing?: number;
}) {
    return <Stack spacing={spacing} sx={{ my: 2 }}>{children}</Stack>;
}

// --------------------------------------
// エクスポート一覧（辞典）
// --------------------------------------

export const mdxComponents = {
    Tip,
    Warning,
    Danger,
    StepBox,
    InfoCard,
    MdxImage,
    MdxButton,
    MdxStack,
    // MUI コンポーネントもそのまま使えるようにする
    Box,
    Alert,
    Button,
    Paper,
    Typography,
    Divider,
    Card,
    CardContent,
    Stack,
    Chip,
    Image, // Next.js Image
};
