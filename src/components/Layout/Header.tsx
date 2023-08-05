import Link from "next/link";
import LoginLogoutBtn from "../auth/LoginLogoutBtn";
import ThemeSwitcher from "../ThemeSwitcher";

export default function Header() {
	return (
		<nav className="flex flex-col justify-between items-center p-4 sm:flex-row">
			<Link className="flex items-center" href="/">
				<img src="/logo.svg" alt="logo" className="w-10 h-10" />
				<h1 className="text-2xl font-bold ml-2">SitterSync</h1>
			</Link>

			<div className="flex items-center gap-2">
				<LoginLogoutBtn />
				<ThemeSwitcher />
			</div>
		</nav>
	);
}
