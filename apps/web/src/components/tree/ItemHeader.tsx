import type { HierarchyNode } from '../../types';
import styles from './ItemHeader.module.css';

interface ItemHeaderProps {
	selectedItem: HierarchyNode;
	getTypeIcon: (type: string) => string;
	getTypeColor: (type: string) => string;
	getTypeLabel: (type: string) => string;
	formatDate: (dateString: string) => string;
}

export default function ItemHeader(props: ItemHeaderProps) {
	return (
		<div class={styles.container}>
			<div class={styles.topSection}>
				<div class={styles.titleArea}>
					<div class={styles.iconBox}>
						<i
							class={props.getTypeIcon(props.selectedItem.type)}
							style={{ 'font-size': '1.5rem', color: '#4b5563' }}
						/>
					</div>
					<div>
						<h1 class={styles.title}>
							{props.selectedItem.name}
						</h1>
						<span
							class={`${styles.badge} ${props.getTypeColor(props.selectedItem.type)}`}
						>
							{props.getTypeLabel(props.selectedItem.type)}
						</span>
					</div>
				</div>
			</div>

			{/* Metadata */}
			<div class={styles.metadata}>
				<div>
					<p class={styles.metadataLabel}>ID</p>
					<p class={styles.metadataValueMono}>
						{props.selectedItem.id}
					</p>
				</div>
				<div>
					<p class={styles.metadataLabel}>Type</p>
					<p class={styles.metadataValue}>
						{props.getTypeLabel(props.selectedItem.type)}
					</p>
				</div>
				<div>
					<p class={styles.metadataLabel}>Created At</p>
					<p class={styles.metadataValue}>
						{props.formatDate(props.selectedItem.createdAt)}
					</p>
				</div>
				<div>
					<p class={styles.metadataLabel}>Updated At</p>
					<p class={styles.metadataValue}>
						{props.formatDate(props.selectedItem.updatedAt)}
					</p>
				</div>
			</div>
		</div>
	);
}
