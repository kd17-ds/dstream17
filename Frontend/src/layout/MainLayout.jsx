import Navbar from "../components/Navbar/Navbar";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer/Footer";


export default function MainLayout() {
    const location = useLocation();
    const path = location.pathname;
    return (
        <>
            <Navbar />
            <Outlet />
            {path !== "/" && <Footer />}
        </>
    )
}