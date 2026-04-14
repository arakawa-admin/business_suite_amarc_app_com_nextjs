"use client";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Breadcrumbs,
    Link,
    Typography,
} from "@mui/material";

import HomeIcon from '@mui/icons-material/Home';

export default function ApprovalBreadcrumbs({
    items,
}: {
    items:
    {
        title: string;
        href?: string;
        // icon?: React.ReactNode;
    }[]
}) {
    const router = useRouter();

    return (
        <Box sx={{ py: 1 }} >
            <Breadcrumbs>
                <Link
                    underline="hover"
                    fontSize="small"
                    color="inherit"
                    onClick={() => router.push('/approval')}
                    >
                    <Button variant="text" sx={{ px: 1, py: 0 }} startIcon={<HomeIcon />}>
                        トップ
                    </Button>
                </Link>
                {items.map((item, i) => (
                    <Box key={i}>
                        {item.href!==undefined ? (
                            <Link
                                underline="hover"
                                fontSize="small"
                                color="inherit"
                                onClick={() => router.push(item.href ?? "")}
                                >
                                <Button variant="text" sx={{ px: 1, py: 0 }}>{item.title}</Button>
                            </Link>
                        ) : (
                            <Typography
                                sx={{ color: 'text.inherit' }}
                                component={'span'}
                                fontSize="small"
                                >
                                {item.title}
                            </Typography>
                        )}
                    </Box>
                ))}
            </Breadcrumbs>
        </Box>
    )
}

