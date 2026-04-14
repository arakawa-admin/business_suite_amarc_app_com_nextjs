import type { SvgIconProps } from "@mui/material/SvgIcon";


import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import UpdateIcon from '@mui/icons-material/Update';

import FolderSharedIcon from '@mui/icons-material/FolderShared';

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

import GoogleIcon from '@mui/icons-material/Google';
import BackupIcon from '@mui/icons-material/Backup';

import DescriptionIcon from "@mui/icons-material/Description";

const ICON_MAP = {
    Person: PersonIcon,
    PersonAdd: PersonAddIcon,
    PersonAddAlt: PersonAddAltIcon,
    GroupAdd: GroupAddIcon,
    Update: UpdateIcon,

    FolderShared: FolderSharedIcon,

    LocalShipping: LocalShippingIcon,
    DirectionsCar: DirectionsCarIcon,

    Google: GoogleIcon,
    Backup: BackupIcon,

    Description: DescriptionIcon,
} as const;

export type IconKey = keyof typeof ICON_MAP;

export function MuiIcon({
    name,
    ...props
}: { name?: string | null } & SvgIconProps) {
    const IconComp =
        (name && (ICON_MAP as Record<string, any>)[name]) || DescriptionIcon; // fallback
    return <IconComp {...props} />;
}
