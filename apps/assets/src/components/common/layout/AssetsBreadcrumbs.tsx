"use client";
import { useRouter } from "next/navigation";
import {
    Button,
    Breadcrumbs,
    Link,
    Box,
    Divider,
} from "@mui/material";
// import HomeIcon from '@mui/icons-material/Home';

export default function AssetsBreadcrumbs({
    items,
}: {
    items?:
    {
        title: string;
        href?: string;
    }[]
}) {
    const router = useRouter();

    return (
        <Box sx={{ px: 1 }}>
            <Breadcrumbs
                separator="›"
                sx={{
                    ".MuiBreadcrumbs-separator": { mx: 0 }
                }}
                >
                <Link
                    underline="hover"
                    fontSize="small"
                    color="inherit"
                    onClick={() => router.push('/')}
                    >
                    <Button
                        variant="text"
                        // startIcon={<HomeIcon />}
                        >
                        ホーム
                    </Button>
                </Link>
                {items?.map((item, i) => (
                    <Link
                        key={i}
                        underline="hover"
                        fontSize="small"
                        color="inherit"
                        onClick={() => item.href && router.push(item.href)}
                        >
                        <Button
                            variant="text"
                            disabled={item.href===undefined}
                            >
                            {item.title}
                        </Button>
                    </Link>
                ))}
            </Breadcrumbs>
            <Divider />
        </Box>
    )
}

