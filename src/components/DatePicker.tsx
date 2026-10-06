import { CalendarIcon } from "lucide-react";
import { Button } from "@libertai/ui/button";
import { Calendar } from "@libertai/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@libertai/ui/popover";
import { formatUTCDay } from "@/utils/dates";

export function DatePicker({
	date,
	setDate,
	placeholder = "Pick a date",
}: {
	date: Date | undefined;
	setDate: (date: Date | undefined) => void;
	placeholder?: string;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" className="w-full justify-start text-left font-normal">
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? formatUTCDay(date, { dateStyle: "long" }) : placeholder}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar timeZone="UTC" mode="single" selected={date} onSelect={setDate} />
			</PopoverContent>
		</Popover>
	);
}
