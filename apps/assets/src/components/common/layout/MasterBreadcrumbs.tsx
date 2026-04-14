"use client";
import { useRouter } from "next/navigation";
import {
    Button,
    Breadcrumbs,
    Link,
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';

export default function MasterBreadcrumbs({
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
                onClick={() => router.push('/admin')}
                >
                <Button variant="text" startIcon={<HomeIcon />}>
                    マスタ一覧
                </Button>
            </Link>
            {items?.map((item, i) => (
                <Link
                    key={i}
                    underline="hover"
                    fontSize="small"
                    color="inherit"
                    onClick={() => router.push(item.href ?? "")}
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
    )
}

