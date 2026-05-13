'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/vocabulary', label: 'Words', icon: '📚' },
  { href: '/verbs', label: 'Verbs', icon: '✏️' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🇩🇪</span>
        <span className={styles.logoText}>DeutschLernen</span>
      </div>
      <ul className={styles.navList}>
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {isActive && <span className={styles.activeIndicator} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
