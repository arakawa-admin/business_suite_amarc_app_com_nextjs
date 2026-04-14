"use client";

import {
    Toolbar,
    Container,
    Grid,
    Paper,
    Stack,
} from "@mui/material";

import { ApproveFlowButton } from "@/components/approval/buttons/ApproveFlowButton";
import { ApprovalListButton } from "@/components/approval/buttons/ApprovalListButton";
import { PlanSelectButton } from "@/components/approval/buttons/PlanSelectButton";
import { OldApprovalListButton } from "@/components/approval/buttons/OldApprovalListButton";
import { ApprovalSearchButton } from "@/components/approval/buttons/ApprovalSearchButton";

import { PlanCreateButton } from "@/components/approval/buttons/PlanCreateButton";
import { PlanListButton } from "@/components/approval/buttons/PlanListButton";

export default function ClientPageDetail() {
    return (
        <Container
            sx={{ p: 3, mb: 6 }}
            maxWidth="lg"
            >
            <Stack spacing={6}>
                <Paper elevation={4}>
                    <Toolbar
                        variant="dense"
                        sx={{
                            backgroundColor: "success.main",
                            color: "success.contrastText",
                            fontWeight: "bold",
                        }}
                        >
                        稟議書
                    </Toolbar>
                    <Grid container spacing={3} sx={{ p: 2 }}>
                        <Grid size={6}>
                            <PlanSelectButton />
                        </Grid>
                        <Grid size={6}>
                            <ApprovalListButton />
                        </Grid>
                        <Grid size={4}>
                            <ApprovalSearchButton />
                        </Grid>
                        <Grid size={4}>
                            <ApproveFlowButton />
                        </Grid>
                        <Grid size={4}>
                            <OldApprovalListButton />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper elevation={4}>
                    <Toolbar
                        variant="dense"
                        sx={{
                            backgroundColor: "info.main",
                            color: "info.contrastText",
                            fontWeight: "bold",
                        }}
                        >
                        設備投資計画
                    </Toolbar>
                    <Grid container spacing={3} sx={{ p: 2 }}>
                        <Grid size={6}>
                            <PlanCreateButton />
                        </Grid>
                        <Grid size={6}>
                            <PlanListButton />
                        </Grid>
                    </Grid>
                </Paper>
            </Stack>

        </Container>
    )
}

