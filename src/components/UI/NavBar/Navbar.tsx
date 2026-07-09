import { useState } from 'react';
import { Search, Bell, Sun, Settings, ChevronDown, Menu } from 'lucide-react';
import styles from './Navbar.module.css';
import useSystemStore from '../../../store/useSystemStore';

export interface NavbarProps {
  /** Abre el drawer del Sidebar en mobile — el botón solo es visible <768px. */
  onMenuClick?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  hasNotifications?: boolean;
  userName?: string;
  userRole?: string;
  userInitials?: string;
}

export function Navbar({
  onMenuClick,
  searchPlaceholder = 'Buscar…',
  searchValue,
  onSearchChange,
  hasNotifications = true,
  userName = 'María Cárdenas',
  userRole = 'Administradora',
  userInitials = 'MC',
}: NavbarProps) {

  const setTheme = useSystemStore(c => c.setTheme)
  const theme = useSystemStore(c => c.theme)
  // Solo aplica en mobile: si el buscador colapsado está expandido.
  // En desktop esta clase no tiene efecto (el CSS de .search ya es el ancho fijo de 320px).
  const [isSearchOpen, setSearchOpen] = useState(false)

  return (
    <div className={styles.navbar}>
      <button type="button" className={styles.menuBtn} onClick={onMenuClick} aria-label="Abrir menú">
        <Menu className={styles.icon} />
      </button>

      <div
        className={`${styles.search} ${isSearchOpen ? styles.searchExpanded : ''}`}
        onClick={() => setSearchOpen(true)}
      >
        <Search className={styles.icon} />
        <input
          className={styles.searchInput}
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          onBlur={() => setSearchOpen(false)}
        />
      </div>

      <div className={`${styles.spacer} ${isSearchOpen ? styles.hiddenOnSearch : ''}`} />

      <button type="button" className={`${styles.iconBtn} ${isSearchOpen ? styles.hiddenOnSearch : ''}`} aria-label="Notificaciones">
        <Bell className={styles.icon} />
        {hasNotifications && <span className={styles.dot} />}
      </button>

      <button type="button"
        className={`${styles.iconBtn} ${isSearchOpen ? styles.hiddenOnSearch : ''}`}
        aria-label="Cambiar tema"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        <Sun className={styles.icon} />
      </button>

      <button type="button" className={`${styles.iconBtn} ${isSearchOpen ? styles.hiddenOnSearch : ''}`} aria-label="Configuración">
        <Settings className={styles.icon} />
      </button>

      <button type="button" className={`${styles.user} ${isSearchOpen ? styles.hiddenOnSearch : ''}`}>
        <div className={styles.avatar}>{userInitials}</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{userName}</div>
          <div className={styles.userRole}>{userRole}</div>
        </div>
        <ChevronDown className={styles.icon} />
      </button>
    </div>
  );
}
