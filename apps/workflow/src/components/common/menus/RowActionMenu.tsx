"use client";

import { useState } from "react";
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export function RowActionMenu({
    can = true,
    onEdit,
    onDelete,
    editLabel = "編集",
    deleteLabel = "削除",
}: {
    can?: boolean;
    editLabel?: string;
    deleteLabel?: string;
    onEdit: (ctx: { closeMenu: () => void }) => void;
    onDelete: (ctx: { closeMenu: () => void }) => void;
}) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const closeMenu = () => setAnchorEl(null);

    if (!can) return null;

    return (
        <>
            <IconButton size="small" onClick={handleMenu}>
                <MoreVertIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={closeMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <MenuItem
                    onClick={() => {
                        onEdit({ closeMenu });
                    }}
                >
                    <ListItemIcon>
                        <EditIcon fontSize="small" color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={editLabel} sx={{ color: "warning.main" }} />
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        onDelete({ closeMenu });
                    }}
                >
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary={deleteLabel} sx={{ color: "error.main" }} />
                </MenuItem>
            </Menu>
        </>
    );
}
