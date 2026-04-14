"use client";

import { Chip } from "@mui/material";
import { resolveMasterValidityStatusName } from "../helpers/masterValidity";
import type { MasterValidityStatus } from "../types/masterCommonTypes";

type Props = {
    status: MasterValidityStatus;
};

export function MasterValidityChip({ status }: Props) {
    const label = resolveMasterValidityStatusName(status);

    if (status === "active") {
        return <Chip label={label} color="success" size="small" />;
    }

    if (status === "upcoming") {
        return <Chip label={label} color="warning" size="small" variant="outlined" />;
    }

    return <Chip label={label} color="default" size="small" variant="outlined" />;
}
