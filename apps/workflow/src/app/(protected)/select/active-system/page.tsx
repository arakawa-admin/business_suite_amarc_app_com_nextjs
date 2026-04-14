"use client";
import { useTransition } from "react";

import { useActiveSystem } from "@/contexts/ActiveSystemContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Button,
    Typography,
    Card,
    CardContent,
    CardActions,
    Container,
    Toolbar,
    Grid
} from "@mui/material";
// import LoadingScreen from "@/components/common/layout/LoadingScreen";

export default function SelectStaffPage() {
    const router = useRouter();
    const { setActiveSystem } = useActiveSystem();

    const sp = useSearchParams();
    const returnTo = sp.get("returnTo") ? decodeURIComponent(sp.get("returnTo")!) : null;

    const [pending, start] = useTransition();

    const systems = [
        {name: "稟議書", path: "approval"},
        {name: "申請システム", path: "apply"},
    ]
    const handleSelect = (systemPath: string) => {
        start(async () => {
            setActiveSystem(systemPath);
            sessionStorage.setItem("activeSystem", systemPath);

            if(returnTo){
                router.replace(returnTo)
                return;
            }
            router.replace(`/${systemPath}`);
        });
    };

    // if (!user) return <LoadingScreen />

    return (
        <Container
            maxWidth="lg"
            sx={{
                p: 4
            }}
            >
            <Card
                variant="outlined"
                >
                <Toolbar
                    variant="dense"
                    sx={{
                        backgroundColor: "primary.main",
                        color: "white",
                        fontWeight: "bold",
                    }}
                    >
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        システム選択
                    </Typography>
                </Toolbar>
                <Typography variant="body1" sx={{ m: 2 }}>
                    どのシステムを操作しますか？下記から選択してください。
                </Typography>

                <Grid container spacing={2} sx={{ m: 2 }}>
                    {systems.map((system) => (
                        <Grid
                            key={system.path}
                            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                            >
                            <Card
                                variant="outlined"
                                >
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>{system.name}</Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        onClick={() => handleSelect(system.path)}
                                        variant="contained"
                                        fullWidth
                                        className="bg-gradient-to-br from-primary-dark via-primary-main to-primary-light"
                                        disabled={pending}
                                        >
                                        選択
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Card>
        </Container>
    );
}
