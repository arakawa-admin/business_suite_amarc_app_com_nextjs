"use client";
import { useTransition } from "react";

import { useAuth } from "@/contexts/AuthContext";
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

import LoadingScreen from "@/components/common/layout/LoadingScreen";

export default function SelectStaffPage() {
    const { user, setProfile } = useAuth();
    const router = useRouter();

    const sp = useSearchParams();
    const returnTo = sp.get("returnTo") ? decodeURIComponent(sp.get("returnTo")!) : null;

    const [pending, start] = useTransition();

    const handleSelect = (staffId: string) => {
        start(async () => {
            const staff = user?.staffs.find((s) => s.id === staffId);
            if (!staff) return;

            setProfile(staff);
            sessionStorage.setItem("selectedStaffId", staff.id);

            if(returnTo){
                router.replace(returnTo)
                return;
            }
            router.replace("/");
        });
    };

    if (!user) return <LoadingScreen />

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
                        ユーザ選択
                    </Typography>
                </Toolbar>
                <Typography variant="body1" sx={{ m: 2 }}>
                    どのユーザで操作しますか？下記から選択してください。
                </Typography>

                <Grid container spacing={2} sx={{ m: 2 }}>
                    {user.staffs.map((staff) => (
                        <Grid
                            key={staff.id}
                            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                            >
                            <Card
                                variant="outlined"
                                >
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>{staff.name}</Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        onClick={() => handleSelect(staff.id)}
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
