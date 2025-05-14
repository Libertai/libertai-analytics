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
				<Button variant={hasCustomDateBeenClicked ? "default" : "outline"}>
					{rangeDate?.from ? (
						rangeDate?.to ? (
							<>
								{format(rangeDate?.from, "LLL dd, y")} - {format(rangeDate?.to, "LLL dd, y")}
							</>
						) : (
							format(rangeDate?.from, "LLL dd, y")
						)
					) : (
						<span>Pick a date</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent>
				<Calendar
					className={""}
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