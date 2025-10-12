import { Show, For } from 'solid-js';
import type { Note as NoteType } from '../../types';
import { parseTags } from '../../utils';
import styles from './Note.module.css';

interface NoteProps {
	note: NoteType;
	formatDate: (dateString: string) => string;
}

export default function Note(props: NoteProps) {
	const tags = () => parseTags(props.note.tags);

	return (
		<div class={styles.container}>
			<div class={styles.header}>
				<div class={styles.content}>
					<p class={styles.text}>
						{props.note.content}
					</p>
				</div>
				<button class={styles.menuButton}>
					<i class="fas fa-ellipsis-v" />
				</button>
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
