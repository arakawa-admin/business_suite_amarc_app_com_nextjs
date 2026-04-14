"use client";

import {
    Toolbar,
    Container,
    Grid,
    Paper,
    Stack,
    CardActionArea, Card, CardContent,
    Typography,
} from "@mui/material";

import { ApplyFormType } from "@/schemas/apply/applyFormSchema";
import { MuiIcon } from "@/components/common/parts/MuiIcon";

export default function ClientPageApplyForm({
    forms
}: {
    forms: ApplyFormType[]
}) {
    const grouped = Object.values(Object.groupBy(
                        forms.sort((a, b) => a.category.sort_order - b.category.sort_order),
                        (form) => form.category.sort_order
                    ));

    return (
        <Container
            sx={{ p: 3, mb: 6 }}
            maxWidth="xl"
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
                        申請システム
                    </Toolbar>
                    {grouped.map((group, idx) => (
                        <Paper key={idx} sx={{ p: 2 }}>
                            {group && <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", p: 1 }}>{group[0].category.name}</Typography>}
                            <Grid container spacing={2}>
                                {group?.map((form) => (
                                    <Grid key={form.id} size={{ md: 6, lg: 4, xl: 3 }}>
                                        <CardActionArea
                                            href={`/apply/${form.code}`}
                                            >
                                            <Card
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: 4,
                                                }}
                                                className="shadow-lg"
                                                >
                                                <CardContent
                                                    sx={{
                                                        minHeight: "10em",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        p: 4
                                                    }}
                                                    >
                                                    <Stack spacing={1}>
                                                        <MuiIcon
                                                            name={form.icon ?? "Description"}
                                                            sx={{
                                                                fontSize: "2em",
                                                                mb: 1,
                                                            }}
                                                            color="info"
                                                            />
                                                        <Typography
                                                            gutterBottom
                                                            variant="h6"
                                                            component="div"
                                                            sx={{ fontWeight: "bold" }}
                                                            color="info"
                                                            >
                                                            {form.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {form.description}
                                                        </Typography>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        </CardActionArea>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    ))}
                </Paper>
            </Stack>
        </Container>
    )
}

