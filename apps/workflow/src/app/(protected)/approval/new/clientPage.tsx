"use client";

import {
    Box,
    Button,
    Toolbar,
    Container,
    Grid,
    Paper,
    Stack,
    CardActionArea,
    Card,
    CardContent,
    Typography,
} from "@mui/material";

import { ApprovalCreateButton } from "@/components/approval/buttons/ApprovalCreateButton";
import ApprovalBreadcrumbs from "@/components/approval/parts/ApprovalBreadcrumbs";

export default function ClientPageDetail(){
//     {
//     // plans,
// }: {
//     // TODO schema of plan
//     plans: {
//         id: number;
//         name: string;
//     }
// }) {
    return (
        <Container
            sx={{ p: 3, mb: 6 }}
            maxWidth="lg"
            >
            <ApprovalBreadcrumbs
                items={[
                    {
                        title: "新規作成",
                    },
                ]}
                />
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
                        <Typography sx={{ flexGrow: 1 }}>
                            予算内（設備投資計画）から起案
                        </Typography>
                        <Button
                            // onClick={() => {}}
                            variant="outlined"
                            size="small"
                            color="success"
                            sx={{
                                backgroundColor: "white",
                            }}
                            >
                            計画を追加
                        </Button>
                    </Toolbar>
                    <Grid container spacing={1} sx={{ p: 2 }}>
                        {
                            [
                                {id: 1, name: "計画A", budget: 1000000},
                                {id: 2, name: "計画B", budget: 1000000},
                                {id: 3, name: "計画C", budget: 1000000},
                                {id: 4, name: "計画D", budget: 1000000},
                                {id: 5, name: "計画E", budget: 1000000},
                            ].map((plan) => (
                                <Grid
                                    key={plan.id}
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                        md: 4,
                                    }}
                                    >
                                    <Card variant="outlined">
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography
                                                    gutterBottom
                                                    variant="caption"
                                                    component="div"
                                                    color="text.secondary"
                                                    >
                                                    No. {plan.id}
                                                </Typography>

                                                <Typography
                                                    gutterBottom
                                                    variant="h6"
                                                    component="div"
                                                    >
                                                    {plan.name}
                                                </Typography>
                                                <Typography
                                                    gutterBottom
                                                    variant="subtitle2"
                                                    component="div"
                                                    color="text.secondary"
                                                    >
                                                    ¥ {plan.budget.toLocaleString("ja-JP")}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))
                        }
                    </Grid>
                </Paper>

                <Paper elevation={4}>
                    <Toolbar
                        variant="dense"
                        sx={{
                            backgroundColor: "warning.main",
                            color: "warning.contrastText",
                            fontWeight: "bold",
                        }}
                        >
                        予算外から起案
                    </Toolbar>
                    <Box sx={{ p: 2 }}>
                        <ApprovalCreateButton
                            color="warning"
                            sx={{ py: 2, width: "100%", fontSize: "1.25rem", fontWeight: "bold" }}
                            />
                    </Box>
                </Paper>
            </Stack>

        </Container>
    )
}

