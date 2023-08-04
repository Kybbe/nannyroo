import { ReactNode } from "react";

export default function Loader({
	loading,
	children,
}: {
	loading: boolean;
	children: ReactNode;
}) {
	const asd = 1;

	if (loading) {
		return (
			<div className="flex flex-1 justify-center items-center flex-col text-center">
				<div className="h-24 w-24 text-center">
					<svg
						x="0px"
						y="0px"
						width="24px"
						height="30px"
						viewBox="0 0 24 30"
						xmlSpace="preserve"
						className="h-24 w-24"
					>
						<rect
							x="0"
							y="10"
							width="4"
							height="10"
							opacity="0.2"
							className="fill-current"
						>
							<animate
								attributeName="opacity"
								attributeType="XML"
								values="0.2; 1; .2"
								begin="0s"
								dur="0.6s"
								repeatCount="indefinite"
							/>
							<animate
								attributeName="height"
								attributeType="XML"
								values="10; 20; 10"
								begin="0s"
								dur="0.6s"
								repeatCount="indefinite"
							/>
							<animate
								attributeName="y"
								attributeType="XML"
								values="10; 5; 10"
								begin="0s"
								dur="0.6s"
								repeatCount="indefinite"
							/>
						</rect>
						<rect
							x="8"
							y="10"
							width="4"
							height="10"
							className="fill-current"
							opacity="0.2"
						>
							<animate
								attributeName="opacity"
								attributeType="XML"
								values="0.2; 1; .2"
								begin="0.15s"
								dur="0.6s"
								repeatCount="indefinite"
							/>
							<animate
								attributeName="height"
								attributeType="XML"
								values="10; 20; 10"
								begin="0.15s"
								dur="0.6s"
								repeatCount="indefinite"
							/>
							<animate
								attributeName="y"
								attributeType="XML"
								values="10; 5; 10"
								begin="0.15s"
								dur="0.6s"
								repeatCount="indefinite"
							/>
						</rect>
						<rect
							x="16"
							y="10"
							width="4"
							height="10"
							className="fill-current"
							opacity="0.2"
						>
							<animate
								attributeName="opacity"
								attributeType="XML"
								values="0.2; 1; .2"
								begin="0.3s"
								dur="0.6s"
								repeatCount="indefinite"
							/>
							<animate
								attributeName="height"
								attributeType="XML"
								values="10; 20; 10"
								begin="0.3s"
								dur="0.6s"
								repeatCount="indefinite"
							/>
							<animate
								attributeName="y"
								attributeType="XML"
								values="10; 5; 10"
								begin="0.3s"
								dur="0.6s"
								repeatCount="indefinite"
							/>
						</rect>
					</svg>
				</div>
				<h1 className="text-4xl text-primaryDark">Loading...</h1>
			</div>
		);
	}

	return children;
}
