"use client";

import { Button, Link } from "@mui/material";

import { ApplicationWithRevisionsType } from "@/schemas/apply/applicationSchema";

export default function ClientPageApplications({
    applications,
}: {
    applications: ApplicationWithRevisionsType[]
}) {
    {
        return (
            <div>
                <Button
                    href="/apply/re-employment/new"
                    variant="contained"
                    sx={{ my: 1 }}
                    >
                    新規作成
                </Button>

                <ul>
                    {applications.map((application) => (
                        <li key={application.id}>
                            <Link
                                href={`/apply/${application.apply_form.code}/${application.id}`}
                                >
                                <Button>
                                    {application.author.staff.name}
                                </Button>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}
