import React from "react";

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from "@mui/material/Box";
import IconButton from '@mui/material/IconButton';

import CloseIcon from '@mui/icons-material/Close';

export default function DialogMasterForm({
    isOpen,
    title,
    isCreate=true,
    onClose,
    children
}: {
    isOpen: boolean,
    title: string,
    isCreate: boolean,
    onClose: () => void,
    children: React.ReactNode
}) {
    const handleClose = (event: React.MouseEvent<HTMLButtonElement>, reason?: string) => {
        if (reason !== 'backdropClick') {
            onClose()
        }
    };

    return (
        <>
        <Dialog
            open={isOpen}
            onClose={handleClose}
            fullWidth
            maxWidth="lg"
            >
            <Toolbar
                className="shadow-lg justify-between"
                sx={{
                    backgroundColor: isCreate ? "primary.main" : "warning.main",
                }}
                >
                <Box>
                    <Typography
                        component="div"
                        sx={{
                            fontWeight: "bold",
                            px: 0,
                            color: "white",
                        }}
                        >
                        {title} {isCreate ? "新規作成" : "編集"}
                    </Typography>
                </Box>
                <Box>
                    <IconButton
                        sx={{ color: "white" }}
                        onClick={(e) => handleClose(e)}
                        >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Toolbar>
            <DialogContent dividers>
                { children }
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={(e) => handleClose(e)}
                    className="grow"
                    color="inherit"
                    size="large"
                    endIcon={<CloseIcon style={{ fontSize: "0.9em" }} />}
                    >
                    閉じる
                </Button>
            </DialogActions>
        </Dialog>
        </>
    );
}
