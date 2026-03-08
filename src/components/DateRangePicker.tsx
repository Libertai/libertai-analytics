import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import React, { Dispatch } from "react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";

type DateRangePickerProps = {
	hasCustomDateBeenClicked: boolean,
	rangeDate: DateRange | undefined,
	setRangeDate: Dispatch<React.SetStateAction<DateRange | undefined>>,
}

const DateRangePicker = ({hasCustomDateBeenClicked, rangeDate, setRangeDate}: DateRangePickerProps) => {

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="max-md:h-8 max-md:px-3 max-md:text-xs" variant={hasCustomDateBeenClicked ? "default" : "outline"}>
					{rangeDate?.from ? (
						rangeDate?.to ? (
							<>
								<span className="hidden sm:inline">
									{format(rangeDate?.from, "LLL dd, y")} - {format(rangeDate?.to, "LLL dd, y")}
								</span>
								<span className="sm:hidden">
									{format(rangeDate?.from, "MM/dd")} - {format(rangeDate?.to, "MM/dd")}
								</span>
							</>
						) : (
							format(rangeDate?.from, "LLL dd, y")
						)
					) : (
						<span>Pick a date</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					className=""
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