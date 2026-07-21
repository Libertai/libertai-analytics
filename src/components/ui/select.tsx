import * as React from "react";
import { cn } from "@/lib/utils";

// Stays local (not @libertai/ui/select): this is a styled native <select>, the shared one is a
// radix combobox with an incompatible API.

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
	({ className, ...props }, ref) => (
		<select
			ref={ref}
			className={cn(
				"h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
				className,
			)}
			{...props}
		/>
	),
);
Select.displayName = "Select";
