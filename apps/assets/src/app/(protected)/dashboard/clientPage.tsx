"use client";
import { Grid, Container, Box, Button, Paper } from "@mui/material";

export default function ClientPageDashboard() {
    return (
        <Box
            sx={{
                p: 4,
            }}
            >
            <Container maxWidth="xl">
                <Paper
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        height: "80vh"
                    }}
                    >
                    <Grid container spacing={1}>
                    {
                        [
                            {label: "許認可", color: "primary", href: "/permits"},
                            {label: "車両", color: "primary", href: "/vehicles"},
                        ].map(({label, color, href}) => (
                            <Grid key={label} size={3}>
                                <Button
                                    variant="contained"
                                    href={href}
                                    className={`bg-gradient-to-br from-${color}-dark via-${color}-main to-${color}-light`}
                                    size="large"
                                    sx={{
                                        width: "100%",
                                        minHeight: "6rem",
                                        borderRadius: 4,
                                        fontWeight: "bold",
                                        fontSize: "1.1rem",
                                    }}
                                    >
                                    {label}
                                </Button>
                            </Grid>
                        ))
                    }
                    </Grid>
                </Paper>
            </Container>
        </Box>
    )
}

