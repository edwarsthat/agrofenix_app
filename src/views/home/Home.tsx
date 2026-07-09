import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../../components/UI/Sidebar/SideBar";
import useSessionStore from "../../store/useSessionStore";
import styles from "./Layout.module.css";
import { Navbar } from "../../components/UI/NavBar/Navbar";

export default function Home(): React.JSX.Element {
    const usuario = useSessionStore((s) => s.usuario)
    const inicial = usuario?.charAt(0).toUpperCase() ?? ""
    const [sidebarAbierto, setSidebarAbierto] = useState(false)

    return (
        <div className={styles.appShell}>
            <SideBar isOpen={sidebarAbierto} onClose={() => setSidebarAbierto(false)} />
            <div className={styles.mainColumn}>
                <Navbar
                    userName={usuario ?? ''}
                    userInitials={inicial}
                    onMenuClick={() => setSidebarAbierto(true)}
                />
                <div className={styles.contentWindow}>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}