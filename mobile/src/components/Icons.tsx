import React from 'react';
import {
  Home,
  ShoppingCart,
  BarChart2,
  User,
  Printer,
  History,
  Tag,
  Package,
  LogOut,
  Calendar,
  Search,
  Banknote,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Settings,
  Info,
  Users,
} from 'lucide-react-native';

interface IconProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export const HomeIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <Home color={color} size={size} strokeWidth={strokeWidth} />
);

export const CartIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <ShoppingCart color={color} size={size} strokeWidth={strokeWidth} />
);

export const ReportIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <BarChart2 color={color} size={size} strokeWidth={strokeWidth} />
);

export const UserIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <User color={color} size={size} strokeWidth={strokeWidth} />
);

export const PrinterIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <Printer color={color} size={size} strokeWidth={strokeWidth} />
);

export const HistoryIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <History color={color} size={size} strokeWidth={strokeWidth} />
);

export const CategoryIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <Tag color={color} size={size} strokeWidth={strokeWidth} />
);

export const ProductIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <Package color={color} size={size} strokeWidth={strokeWidth} />
);

export const LogoutIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <LogOut color={color} size={size} strokeWidth={strokeWidth} />
);

export const CalendarIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <Calendar color={color} size={size} strokeWidth={strokeWidth} />
);

export const SearchIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <Search color={color} size={size} strokeWidth={strokeWidth} />
);

export const CashIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <Banknote color={color} size={size} strokeWidth={strokeWidth} />
);

export const QrisIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <QrCode color={color} size={size} strokeWidth={strokeWidth} />
);

export const LeftIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <ChevronLeft color={color} size={size} strokeWidth={strokeWidth} />
);

export const RightIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <ChevronRight color={color} size={size} strokeWidth={strokeWidth} />
);

export const SettingsIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <Settings color={color} size={size} strokeWidth={strokeWidth} />
);

export const InfoIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <Info color={color} size={size} strokeWidth={strokeWidth} />
);

export const UsersIcon: React.FC<IconProps> = ({ color = '#0F5936', size = 24, strokeWidth = 2 }) => (
  <Users color={color} size={size} strokeWidth={strokeWidth} />
);
