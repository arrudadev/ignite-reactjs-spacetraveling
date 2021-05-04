import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={`${commonStyles.container} ${styles.header}`}>
      <Link href="/">
        <img src="/logo.svg" alt="logo" />
      </Link>
    </header>
  );
}
