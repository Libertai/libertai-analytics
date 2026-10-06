import { Calendar } from "@libertai/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@libertai/ui/popover"
import React, { Dispatch } from "react";
import { Button } from "@libertai/ui/button";
import { DateRange } from "react-day-picker";
import { formatUTCDay } from "@/utils/dates";

type DateRangePickerProps = {
	hasCustomDateBeenClicked: boolean,
	rangeDate: DateRange | undefined,
	setRangeDate: Dispatch<React.SetStateAction<DateRange | undefined>>,
}

const LONG: Intl.DateTimeFormatOptions = { month: "short", day: "2-digit", year: "numeric" };
const SHORT: Intl.DateTimeFormatOptions = { month: "2-digit", day: "2-digit" };

const DateRangePicker = ({hasCustomDateBeenClicked, rangeDate, setRangeDate}: DateRangePickerProps) => {

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="max-md:h-8 max-md:px-3 max-md:text-xs" variant={hasCustomDateBeenClicked ? "default" : "outline"}>
					{rangeDate?.from ? (
						rangeDate?.to ? (
							<>
								<span className="hidden sm:inline">
									{formatUTCDay(rangeDate.from, LONG)} - {formatUTCDay(rangeDate.to, LONG)}
								</span>
								<span className="sm:hidden">
									{formatUTCDay(rangeDate.from, SHORT)} - {formatUTCDay(rangeDate.to, SHORT)}
								</span>
							</>
						) : (
							formatUTCDay(rangeDate.from, LONG)
						)
					) : (
						<span>Pick a date</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					className=""
					timeZone="UTC"
					mode="range"
					selected={rangeDate}
					onSelect={setRangeDate}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	)
}

export default DateRangePicker;