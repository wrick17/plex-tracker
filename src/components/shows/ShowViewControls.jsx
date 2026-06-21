import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "../ui/Button";

const optionClass = (active) =>
	`rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
		active
			? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
			: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
	}`;

const OptionGroup = ({ title, options, value, onChange }) => (
	<div className="space-y-2">
		<p className="font-semibold text-xs text-zinc-500 uppercase dark:text-zinc-400">{title}</p>
		<div className="grid grid-cols-2 gap-2">
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					className={optionClass(value === option.value)}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	</div>
);

const ShowViewControls = ({
	filter,
	filterOptions,
	groupBy,
	groupOptions,
	isOpen,
	onFilterChange,
	onGroupChange,
	onSortChange,
	onToggle,
	sortBy,
	sortOptions,
}) => (
	<div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
		{isOpen && (
			<div className="w-[min(22rem,calc(100vw-2rem))] space-y-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
				<div className="flex items-center justify-between">
					<p className="font-bold text-sm text-zinc-900 dark:text-zinc-50">View</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={onToggle}
						title="Close view controls"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
				<OptionGroup
					title="Filter"
					options={filterOptions}
					value={filter}
					onChange={onFilterChange}
				/>
				<OptionGroup
					title="Sort"
					options={sortOptions}
					value={sortBy}
					onChange={onSortChange}
				/>
				<OptionGroup
					title="Group"
					options={groupOptions}
					value={groupBy}
					onChange={onGroupChange}
				/>
			</div>
		)}
		<Button
			className="h-14 w-14 rounded-full shadow-lg"
			onClick={onToggle}
			title="Open view controls"
			aria-expanded={isOpen}
		>
			<SlidersHorizontal className="h-5 w-5" />
		</Button>
	</div>
);

export default ShowViewControls;
