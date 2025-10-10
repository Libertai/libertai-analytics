/**
 * Format a number with K, M, B suffixes for large numbers
 * @param num - The number to format
 * @param decimals - Maximum number of decimal places (default: 2)
 * @returns Formatted string
 */
export function formatLargeNumber(num: number, decimals: number = 2): string {
	if (num === 0) return "0";

	const absNum = Math.abs(num);
	const sign = num < 0 ? "-" : "";

	if (absNum >= 1_000_000_000) {
		return sign + (absNum / 1_000_000_000).toFixed(decimals).replace(/\.?0+$/, "") + "B";
	}
	if (absNum >= 1_000_000) {
		return sign + (absNum / 1_000_000).toFixed(decimals).replace(/\.?0+$/, "") + "M";
	}
	if (absNum >= 1_000) {
		return sign + (absNum / 1_000).toFixed(decimals).replace(/\.?0+$/, "") + "K";
	}

	// For numbers less than 1000, show up to `decimals` decimal places
	return sign + absNum.toFixed(decimals).replace(/\.?0+$/, "");
}

/**
 * Format credits with exactly 2 decimal places
 * @param num - The credit amount to format
 * @returns Formatted string with K, M, B suffixes and max 2 decimals
 */
export function formatCredits(num: number): string {
	return formatLargeNumber(num, 2);
}

/**
 * Format token counts and API calls (whole numbers)
 * @param num - The count to format
 * @returns Formatted string with K, M, B suffixes (no decimals for whole numbers)
 */
export function formatCount(num: number): string {
	return formatLargeNumber(num, 0);
}
