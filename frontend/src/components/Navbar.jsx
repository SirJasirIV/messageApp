import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import styles from "./Navbar.module.css";
import logo from "../assets/Wink.png";

const links = [
    { to: "/feed", label: "Home" },
    { to: "/conversations", label: "Messages" },
    { to: "/all-users", label: "Find users" },
    { to: "/follow-requests", label: "Requests" },
    { to: "/newChat", label: "New Chat" },
];

function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className={styles.navbar}>
            <div className={styles.inner}>
        <NavLink to="/feed" className={styles.brandLink}>
            <img src={logo} alt="" className={styles.logo} />
            <span className={styles.brand}>Connect</span>
        </NavLink>

                <div className={styles.links}>
                    {links.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                isActive ? `${styles.link} ${styles.active}` : styles.link
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </div>

                <button className={styles.signOut} onClick={() => logout(navigate)}>
                    Sign out
                </button>
            </div>
        </nav>
    );
}

export default Navbar;