const formatTime = (date: string | undefined) => {
	if (!date) return undefined;
	const dateObj = new Date(date);
	let h: number | string = dateObj.getHours();
	if (h < 10) h = `0${h}`;
	let m: number | string = dateObj.getMinutes();
	if (m === 0) m = "00";
	return `${h}:${m}`;
};

const formatDate = (unformatted: string | undefined) => {
	if (!unformatted) return undefined;
	const d = new Date(unformatted);
	const date = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
	const time = formatTime(unformatted);
	return `${date} ${time}`;
};

export { formatDate, formatTime };
