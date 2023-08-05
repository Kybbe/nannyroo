/* eslint-disable jsx-a11y/label-has-associated-control */

"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/redux/useAppDispatch";
import { useAppSelector } from "@/hooks/redux/useAppSelector";
import { setTheme } from "@/store/slices/uiSlice";

export default function ThemeSwitcher() {
	const dispatch = useAppDispatch();
	const storeTheme = useAppSelector(state => state.ui.theme);
	const darktheme = storeTheme === "dark";

	useEffect(() => {
		if (darktheme) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [darktheme]);

	return (
		<button
			type="button"
			className="flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
			onClick={() => dispatch(setTheme(darktheme ? "light" : "dark"))}
		>
			{darktheme ? <MoonIcon /> : <SunIcon />}
		</button>
	);
}
