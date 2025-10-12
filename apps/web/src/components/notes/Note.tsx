import { Show, For } from 'solid-js';
import type { Note as NoteType } from '../../types';
import { parseTags } from '../../utils';

interface NoteProps {
	note: NoteType;
	formatDate: (dateString: string) => string;
}

export default function Note(props: NoteProps) {
	const tags = () => parseTags(props.note.tags);

	return (
		<div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
			<div class="flex items-start justify-between mb-2">
				<div class="flex-1">
					<p class="text-gray-800 whitespace-pre-wrap">
						{props.note.content}
					</p>
				</div>
				<button class="ml-2 text-gray-400 hover:text-gray-600 transition">
					<i class="fas fa-ellipsis-v" />
				</button>
			</div>
			<div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
				<span class="text-xs text-gray-500">
					<i class="fas fa-clock mr-1" />
					{props.formatDate(props.note.createdAt)}
				</span>
				<Show when={tags().length > 0}>
					<div class="flex gap-1">
						<For each={tags()}>
							{tag => (
								<span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
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
