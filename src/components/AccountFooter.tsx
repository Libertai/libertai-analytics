import { useNavigate } from "@tanstack/react-router";
import { AccountMenu } from "@libertai/auth";
import { useSidebar } from "@libertai/ui/sidebar";

/** No `onUpgrade`: analytics has no billing page, so upgrade/plans rows never render. */
export default function AccountFooter() {
	const navigate = useNavigate();
	const { isMobile, setOpenMobile } = useSidebar();

	return (
		<AccountMenu
			onSignedOut={() => void navigate({ to: "/" })}
			onAction={() => {
				if (isMobile) setOpenMobile(false);
			}}
		/>
	);
}
