// src/components/Header/Header.tsx

import clsx from "clsx";
import s from "./Header.module.css";
import type { NavItem } from "./header.types";
import { DEFAULT_NAV } from "./header.config";
import { DomainRounded, NotificationsNoneOutlined } from "@mui/icons-material";
import { useAuth } from "@/context/auth"; // <-- Импортируем хук

interface HeaderProps {
  navItems?: NavItem[];
  activeNavId: string;
  onNavigate: (id: string) => void;
  onBellClick?: () => void;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

export function Header({
  navItems = DEFAULT_NAV,
  activeNavId,
  onNavigate,
  onBellClick,
}: HeaderProps) {
  // Берём данные пользователя из контекста
  const { user } = useAuth();

  return (
    <header className={s.header}>
      <div className={s.row}>
        {/* Логотип */}
        <div className={s.brand}>
          <div className={s.logoBox} aria-hidden>
            <DomainRounded className={s.logoIc} />
          </div>
          <span className={s.app}>Room Booking</span>
        </div>

        {/* Навигация */}
        <nav className={s.nav} aria-label="Основная навигация">
          {navItems.map((item) => {
            const active = item.id === activeNavId;
            return (
              <button
                key={item.id}
                type="button"
                className={clsx(s.tab, active && s.tabActive)}
                onClick={() => onNavigate(item.id)}
                aria-current={active ? "page" : undefined}
              >
                {item.icon && <item.icon className={s.tabIc} />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={s.spacer} />

        {/* Правая часть с пользователем */}
        <div className={s.right}>
          <button
            type="button"
            className={s.iconBtn}
            onClick={onBellClick}
            aria-label="Уведомления"
          >
            <NotificationsNoneOutlined />
          </button>

          {/* Аватар пользователя из контекста */}
          <div className={s.avatar} title={user?.name || "Гость"}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                width={32}
                height={32}
              />
            ) : (
              <span>{getInitials(user?.name)}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}