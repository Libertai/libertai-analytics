import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Button } from "@libertai/ui/button";
import DateRangePicker from "@/components/DateRangePicker";
import { timeframes } from "@/utils/charts";
import { DateFilter } from "@/hooks/useDateFilter";

// Page-level timeframe buttons + custom range picker, bound to a useDateFilter instance.
export function DateFilterBar({ filter }: { filter: DateFilter }) {
	// The calendar needs local state while a range is half-picked; only complete ranges
	// are committed to the URL.
	const [rangeDate, setRangeDate] = useState<DateRange | undefined>(filter.rangeDate);
	const { setRange } = filter;

	useEffect(() => {
		if (rangeDate?.from && rangeDate?.to) setRange(rangeDate);
	}, [rangeDate, setRange]);

	const handleRangeChange: Dispatch<SetStateAction<DateRange | undefined>> = (action) => {
		setRangeDate(action);
	};

	return (
		<div className="flex flex-wrap gap-2">
			{timeframes.map((timeframe) => (
				<Button
					key={timeframe.label}
					className="max-md:h-8 max-md:px-3 max-md:text-xs"
					variant={timeframe.days === filter.timeframeDays && !filter.isCustom ? "default" : "outline"}
					onClick={() => filter.setTimeframe(timeframe.days)}
				>
					{timeframe.label}
				</Button>
			))}
			<div
				onClick={() => {
					if (rangeDate?.from && rangeDate?.to) setRange(rangeDate);
				}}
			>
				<DateRangePicker
					hasCustomDateBeenClicked={filter.isCustom}
					rangeDate={rangeDate}
					setRangeDate={handleRangeChange}
				/>
			</div>
		</div>
	);
}
