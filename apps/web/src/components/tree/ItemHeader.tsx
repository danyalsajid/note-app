import type { HierarchyNode } from '../../types';

interface ItemHeaderProps {
	selectedItem: HierarchyNode;
	getTypeIcon: (type: string) => string;
	getTypeColor: (type: string) => string;
	getTypeLabel: (type: string) => string;
	formatDate: (dateString: string) => string;
}

export default function ItemHeader(props: ItemHeaderProps) {
	return (
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
			<div class="flex items-start justify-between mb-4">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
						<i
							class={props.getTypeIcon(props.selectedItem.type)}
							style={{ "font-size": "1.5rem", "color": "#4b5563" }}
						/>
					</div>
					<div>
						<h1 class="text-3xl font-bold text-gray-900">{props.selectedItem.name}</h1>
						<span
							class={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${props.getTypeColor(props.selectedItem.type)}`}
						>
							{props.getTypeLabel(props.selectedItem.type)}
						</span>
					</div>
				</div>
			</div>

			{/* Metadata */}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
				<div>
					<p class="text-sm text-gray-500 mb-1">ID</p>
					<p class="text-gray-900 font-mono text-sm">{props.selectedItem.id}</p>
				</div>
				<div>
					<p class="text-sm text-gray-500 mb-1">Type</p>
					<p class="text-gray-900">{props.getTypeLabel(props.selectedItem.type)}</p>
				</div>
				<div>
					<p class="text-sm text-gray-500 mb-1">Created At</p>
					<p class="text-gray-900">{props.formatDate(props.selectedItem.createdAt)}</p>
				</div>
				<div>
					<p class="text-sm text-gray-500 mb-1">Updated At</p>
					<p class="text-gray-900">{props.formatDate(props.selectedItem.updatedAt)}</p>
				</div>
			</div>
		</div>
	);
}
