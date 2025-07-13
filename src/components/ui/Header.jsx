import NoticeBanner from "./notice-banner/NoticeBanner";
import NavBar from "./NavBar";

export default function Header() {
    return (
        <header>
            <NoticeBanner />
            <NavBar />
        </header>
    );
}