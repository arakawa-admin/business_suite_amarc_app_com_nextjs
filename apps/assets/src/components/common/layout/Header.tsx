"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@contexts/AuthContext";

import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Drawer,
    Stack,
    Divider,
    useMediaQuery,
    Chip,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";

import LogoutButton from "@/components/common/buttons/LogoutButton";
import AdminButton from "@/components/common/buttons/AdminButton";
import HelpButton from "@/components/common/buttons/HelpButton";
import SwitchStaffButton from "@/components/common/buttons/SwitchStaffButton";

export default function Header() {
    const { user, profile } = useAuth();
    const isDrawer = useMediaQuery("(max-width:1024px)");
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = (open: boolean) => () => {
        setDrawerOpen(open);
    };

    if (!user || !profile) return null;

    return (
        <AppBar component="div" position="sticky">
            <Toolbar className="bg-stone-100 text-gray-700">
                <Box sx={{ flexGrow: 1 }} className="flex items-center min-w-[25%]">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/images/logo.gif"
                            alt="Logo"
                            width={60}
                            height={0}
                            className="mr-2"
                            style={{ height: "auto" }}
                        />
                        <Typography sx={{ fontSize: "1.1rem" }}>
                            {process.env.NEXT_PUBLIC_SITE_TITLE}
                        </Typography>
                    </Link>
                </Box>

                {/* デスクトップ表示時のメインボタン */}
                <Box
                    className="flex items-center justify-end gap-1"
                    sx={{
                        flexGrow: 1,
                        display: isDrawer ? 'none' : 'flex'
                    }}
                >
                    <Box>
                        <Typography
                            className="mr-2 whitespace-nowrap"
                            variant="subtitle2"
                            component={"span"}
                        >
                            ログイン中: {profile?.name}
                        </Typography>
                        <Chip
                            label={profile?.department?.name}
                            size="small"
                            sx={{ mx: 1 }}
                            component={"span"}
                        />
                    </Box>

                    <SwitchStaffButton />
                    <HelpButton />
                    <AdminButton />
                    <LogoutButton />
                </Box>

                {/* モバイル用ハンバーガーメニューボタン */}
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={toggleDrawer(true)}
                    aria-label="menu"
                    sx={{ display: isDrawer ? 'flex' : 'none' }}
                >
                    <MenuIcon />
                </IconButton>

                <Drawer
                    anchor="right"
                    open={isDrawer ? drawerOpen : false}
                    onClose={toggleDrawer(false)}
                >
                    <Box
                        sx={{ width: 250, p: 2 }}
                        role="presentation"
                        // onClick={toggleDrawer(false)}
                        // onKeyDown={toggleDrawer(false)}
                    >
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            <PersonIcon fontSize="small" className="mr-1" />
                            <Chip label={profile?.department?.name} size="small" />
                            {profile?.name} <br />
                            <Typography variant="caption">{user?.email}</Typography>
                        </Typography>

                        <Divider sx={{ my: 1 }} />

                        <Stack spacing={1}>
                            {/* {mainButtons} */}

                            <Divider sx={{ py: 2 }} />

                            <SwitchStaffButton mobile />
                            <HelpButton mobile />
                            <AdminButton mobile />
                            <LogoutButton mobile />
                        </Stack>
                    </Box>
                </Drawer>
            </Toolbar>
        </AppBar>
    );
}
