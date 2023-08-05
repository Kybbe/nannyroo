/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				primaryBackground: "#D7E4E4",
				primaryBright: "#E5FFFC",
				primaryDark: "#387879",
			},
		},
	},
	plugins: [],
	darkMode: "class",
};
