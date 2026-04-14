"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import {
    Box,
    Fab,
    Drawer,
    Typography,
    Chip
} from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';

// import SearchInquiryField from "@/components/inquiry/parts/SearchInquiryField";

export default function SearchDrawer() {
    const params = useSearchParams();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const [searchObj, setSearchObj] = useState({});

    useEffect(() => {
        if(params.get("from")===null || params.get("to")===null) return;
        setSearchObj({
            '受付日': `${params.get("from")}~${params.get("to")}`,
        });
    }, [params]);

    const closeDrawer = (searchObj?: object) => {
        setDrawerOpen(false);
        setSearchObj(searchObj ?? {});
    }

    const searchingFab = () => {
        return (
            <Fab variant="extended" disabled>
                <Typography variant="body2" sx={{ mr: 1 }}>検索中</Typography>
                {Object.entries(searchObj).map(([key, value]) => (
                    <Chip
                        key={key}
                        label={`${key}:${value}`}
                        size="small"
                        sx={{ mr: 0.5 }}
                        color="info"
                        />
                ))}
            </Fab>
        );
    }


    return (
        <Box
            sx={{
                position: 'fixed',
                right: "1em",
                bottom: "1em",
            }}
            >
            <Box sx={{ '& > :not(style)': { m: 1 } }}>
                {Object.keys(searchObj).length!==0 && searchingFab()}
                <Fab
                    color="primary"
                    aria-label="search"
                    onClick={() => setDrawerOpen(true)}
                    size="small"
                    >
                    <SearchIcon />
                </Fab>
            </Box>
            <Drawer
                anchor="bottom"
                open={drawerOpen}
                // onClose={setDrawerOpen(false)}
                >
                <Box
                    sx={{
                        p: 2,
                    }}
                    role="search-drawer"
                    // onClick={setDrawerOpen(false)}
                    // onKeyDown={setDrawerOpen(false)}
                    >
                    {/* <SearchInquiryField
                        onClose={(searchObj) => closeDrawer(searchObj)}
                        /> */}
                </Box>
            </Drawer>
        </Box>
    );
}
