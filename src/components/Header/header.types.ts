import { type SvgIconComponent } from "@mui/icons-material";

export interface NavItem {
  id: string;
  label: string;
  icon?: SvgIconComponent;
}

export interface UserBrief {
  name?: string;
  avatarUrl?: string;
}