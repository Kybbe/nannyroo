export default function ColorPicker({
	color,
	setColor,
}: {
	color: { textColor: string; backgroundColor: string; borderColor: string };
	setColor: (color: {
		textColor: string;
		backgroundColor: string;
		borderColor: string;
	}) => void;
}) {
	const colors = [
		{
			name: "Red",
			textColor: "#000000",
			backgroundColor: "#F87171",
			borderColor: "#F87171",
		},
		{
			name: "Yellow",
			textColor: "#000000",
			backgroundColor: "#FCD34D",
			borderColor: "#FCD34D",
		},
		{
			name: "Green",
			textColor: "#000000",
			backgroundColor: "#34D399",
			borderColor: "#34D399",
		},
		{
			name: "Blue",
			textColor: "#000000",
			backgroundColor: "#60A5FA",
			borderColor: "#60A5FA",
		},
		{
			name: "Purple",
			textColor: "#000000",
			backgroundColor: "#A78BFA",
			borderColor: "#A78BFA",
		},
		{
			name: "Pink",
			textColor: "#000000",
			backgroundColor: "#F472B6",
			borderColor: "#F472B6",
		},
		{
			name: "Gray",
			textColor: "#000000",
			backgroundColor: "#9CA3AF",
			borderColor: "#9CA3AF",
		},
	];

	return (
		<div className="flex flex-row justify-center items-center space-x-2">
			{colors.map(c => (
				<button
					type="button"
					key={c.name}
					className={`h-6 w-6 rounded-full border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
						color.backgroundColor === c.backgroundColor
							? "ring-2 ring-offset-2 ring-black"
							: ""
					}`}
					style={{
						backgroundColor: c.backgroundColor,
					}}
					onClick={() =>
						setColor({
							textColor: c.textColor,
							backgroundColor: c.backgroundColor,
							borderColor: c.borderColor,
						})
					}
				/>
			))}
		</div>
	);
}
