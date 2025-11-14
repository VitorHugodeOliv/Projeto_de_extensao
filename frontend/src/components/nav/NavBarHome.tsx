import styles from "./NavBarHome.module.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.title}>ARQUIVO<br />CULTURAL</div>

      <div className={styles.links}>
        <Link className={styles.link} to="/galeria">Galeria</Link>

        <div className={styles.separator}></div>

        <Link className={styles.link} to="/login">Login</Link>
      </div>
    </nav>
  );
}