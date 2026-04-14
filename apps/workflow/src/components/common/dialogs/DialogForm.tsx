import React from "react";

import {
    Dialog,
    DialogActions,
    DialogContent,
    Typography,
    Button,
    Box,
    IconButton,
    Toolbar,
    // Paper,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// import { useMinimizeForm } from "@/contexts/MinimizeFormContext";

import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from "@mui/icons-material/Minimize";
// import OpenInFullIcon from "@mui/icons-material/OpenInFull";

import DialogConfirm from "@/components/common/dialogs/DialogConfirm";

export default function DialogForm({
    isOpen,
    title,
    isCreate=true,
    minimizable=false,
    // onShow,
    onClose,
    children
}: {
    isOpen: boolean,
    title: string,
    isCreate: boolean,
    minimizable: boolean,
    // onShow: () => void,
    onClose: () => void,
    children: React.ReactNode
}) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // const { isMinimize, setIsMinimize } = useMinimizeForm();

    const [confirmShut, setConfirmShut] = React.useState(false);

    const handleClose = (event: React.MouseEvent<HTMLButtonElement>, reason?: string) => {
        if (reason !== 'backdropClick') {
            onClose()
        }
    };

    const handleFormShowDialog = () => {
        setConfirmShut(true);
    };

    const handleFormCloseDialog = () => {
        onClose();
        setConfirmShut(false);
        // setIsMinimize(false)
    };

    const handleMinimize = () => {
		// Dialogは閉じるが、状態は保持したいので minimized を true に
        // onClose()
        // setIsMinimize(true)
	};

	// const handleRestore = () => {
    //     // setIsMinimize(false)
    //     // onShow()
	// };

    return (
        <>
        <Dialog
            open={
                isOpen
                // && !isMinimize
            }
            onClose={handleClose}
            fullWidth
            maxWidth="lg"
            fullScreen={fullScreen}
            keepMounted
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
                    {minimizable && (
                        <IconButton size="small" onClick={handleMinimize} aria-label="minimize">
                            <MinimizeIcon sx={{ color: "white" }}/>
                        </IconButton>
                    )}
                    <IconButton
                        sx={{ color: "white" }}
                        onClick={handleFormShowDialog}
                        >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Toolbar>
            <DialogContent dividers sx={{ px: 0 }}>
                { children }
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleFormShowDialog}
                    className="grow"
                    color="inherit"
                    size="large"
                    endIcon={<CloseIcon style={{ fontSize: "0.9em" }} />}
                    >
                    閉じる
                </Button>
            </DialogActions>
        </Dialog>

        <DialogConfirm
            isOpen={confirmShut}
            onDone={handleFormCloseDialog}
            onCancel={() => setConfirmShut(false)}
            text="入力内容を破棄して閉じていいですか？"
            okText="OK"
            color="warning"
            />

        {/* 最小化表示（右下固定） */}
        {/* {isMinimize && (
            <Paper
                elevation={8}
                sx={{
                    position: "fixed",
                    right: 16,
                    bottom: 16,
                    width: 400,
                    borderRadius: 2,
                    overflow: "hidden",
                    zIndex: (theme) => theme.zIndex.modal + 1,
                }}
                >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 1.5,
                        py: 1,
                        bgcolor: "warning.main",
                        borderBottom: "1px solid",
                        color: "white",
                        borderColor: "divider",
                        cursor: "pointer",
                    }}
                    onClick={handleRestore}
                >
                    <Typography variant="body2" fontWeight={600} noWrap>
                        作成中 (画面遷移によりデータが消えます)
                    </Typography>

                    <Box onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" onClick={handleRestore} aria-label="restore">
                            <OpenInFullIcon fontSize="small" sx={{ color: "white" }} />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>
        )} */}
        </>
    );
}
