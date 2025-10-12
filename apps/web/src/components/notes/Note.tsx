import { Show, For, createSignal } from 'solid-js';
import type { Note as NoteType } from '../../types';
import { parseTags } from '../../utils';
import styles from './Note.module.css';

interface NoteProps {
	note: NoteType;
	formatDate: (dateString: string) => string;
	onEdit: (note: NoteType) => void;
	onDelete: (note: NoteType) => void;
}

export default function Note(props: NoteProps) {
	const [showMenu, setShowMenu] = createSignal(false);
	const tags = () => parseTags(props.note.tags);

	const handleEdit = () => {
		setShowMenu(false);
		props.onEdit(props.note);
	};

	const handleDelete = () => {
		setShowMenu(false);
		if (confirm('Are you sure you want to delete this note?')) {
			props.onDelete(props.note);
		}
	};

	return (
		<div class={styles.container}>
			<div class={styles.header}>
				<div class={styles.content}>
					<p class={styles.text}>
						{props.note.content}
					</p>
				</div>
				<div class={styles.menuContainer}>
					<button 
						class={styles.menuButton}
						onClick={() => setShowMenu(!showMenu())}
					>
						<i class="fas fa-ellipsis-v" />
					</button>
					<Show when={showMenu()}>
						<div class={styles.dropdown}>
							<button
								class={styles.dropdownItem}
								onClick={handleEdit}
							>
								<i class="fas fa-edit" />
								Edit
							</button>
							<button
								class={styles.dropdownItem}
								onClick={handleDelete}
							>
								<i class="fas fa-trash" />
								Delete
							</button>
						</div>
					</Show>
				</div>
			</div>
			<div class={styles.footer}>
				<span class={styles.timestamp}>
					<i class="fas fa-clock mr-1" />
					{props.formatDate(props.note.createdAt)}
				</span>
				<Show when={tags().length > 0}>
					<div class={styles.tags}>
						<For each={tags()}>
							{tag => (
								<span class={styles.tag}>
									{tag}
								</span>
							)}
						</For>
					</div>
				</Show>
			</div>
		</div>
	);
}
