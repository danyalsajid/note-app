import { createSignal, onCleanup, Show } from 'solid-js';
import styles from './VoiceRecorder.module.css';

interface VoiceRecorderProps {
	onRecordingComplete: (audioBlob: Blob, duration: number) => void;
	onCancel: () => void;
	onRecordingStateChange?: (isRecording: boolean) => void;
}

export default function VoiceRecorder(props: VoiceRecorderProps) {
	const [isRecording, setIsRecording] = createSignal(false);
	const [isPaused, setIsPaused] = createSignal(false);
	const [recordingTime, setRecordingTime] = createSignal(0);
	const [audioURL, setAudioURL] = createSignal<string | null>(null);
	
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let timerInterval: number | null = null;
	let startTime = 0;
	let pausedTime = 0;

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			
			mediaRecorder = new MediaRecorder(stream, {
				mimeType: 'audio/webm',
			});

			audioChunks = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunks.push(event.data);
				}
			};

			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				const url = URL.createObjectURL(audioBlob);
				setAudioURL(url);
				
				// Stop all tracks
				stream.getTracks().forEach(track => track.stop());
			};

			mediaRecorder.start();
			setIsRecording(true);
			props.onRecordingStateChange?.(true);
			startTime = Date.now();
			
			// Start timer
			timerInterval = window.setInterval(() => {
				const elapsed = Math.floor((Date.now() - startTime - pausedTime) / 1000);
				setRecordingTime(elapsed);
			}, 1000);
		} catch (error) {
			console.error('Error accessing microphone:', error);
			alert('Could not access microphone. Please ensure you have granted permission.');
		}
	};

	const pauseRecording = () => {
		if (mediaRecorder && mediaRecorder.state === 'recording') {
			mediaRecorder.pause();
			setIsPaused(true);
			if (timerInterval) {
				clearInterval(timerInterval);
			}
		}
	};

	const resumeRecording = () => {
		if (mediaRecorder && mediaRecorder.state === 'paused') {
			mediaRecorder.resume();
			setIsPaused(false);
			
			const pauseDuration = Date.now() - (startTime + pausedTime);
			pausedTime += pauseDuration;
			
			timerInterval = window.setInterval(() => {
				const elapsed = Math.floor((Date.now() - startTime - pausedTime) / 1000);
				setRecordingTime(elapsed);
			}, 1000);
		}
	};

	const stopRecording = () => {
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
			setIsRecording(false);
			setIsPaused(false);
			props.onRecordingStateChange?.(false);
			
			if (timerInterval) {
				clearInterval(timerInterval);
			}
		}
	};

	const handleSave = () => {
		if (audioChunks.length > 0) {
			const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
			props.onRecordingComplete(audioBlob, recordingTime());
		}
	};

	const handleCancel = () => {
		if (isRecording()) {
			stopRecording();
		}
		if (audioURL()) {
			URL.revokeObjectURL(audioURL()!);
		}
		props.onCancel();
	};

	const handleReset = () => {
		if (audioURL()) {
			URL.revokeObjectURL(audioURL()!);
		}
		setAudioURL(null);
		setRecordingTime(0);
		audioChunks = [];
		pausedTime = 0;
	};

	onCleanup(() => {
		if (timerInterval) {
			clearInterval(timerInterval);
		}
		if (audioURL()) {
			URL.revokeObjectURL(audioURL()!);
		}
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
		}
	});

	return (
		<div class={styles.container}>
			<div class={styles.header}>
				<i class="fas fa-microphone text-blue-600 text-2xl" />
				<h3 class={styles.title}>Voice Note</h3>
			</div>

			<div class={styles.content}>
				<Show when={!audioURL()}>
					<div class={styles.recordingSection}>
						<div class={styles.timer}>
							<Show when={isRecording()}>
								<span class={styles.recordingIndicator} />
							</Show>
							{formatTime(recordingTime())}
						</div>

						<div class={styles.controls}>
							<Show
								when={!isRecording()}
								fallback={
									<>
										<Show
											when={!isPaused()}
											fallback={
												<button
													type="button"
													class={styles.resumeButton}
													onClick={resumeRecording}
													title="Resume"
												>
													<i class="fas fa-play" />
												</button>
											}
										>
											<button
												type="button"
												class={styles.pauseButton}
												onClick={pauseRecording}
												title="Pause"
											>
												<i class="fas fa-pause" />
											</button>
										</Show>
										<button
											type="button"
											class={styles.stopButton}
											onClick={stopRecording}
											title="Stop"
										>
											<i class="fas fa-stop" />
										</button>
									</>
								}
							>
								<button
									type="button"
									class={styles.startButton}
									onClick={startRecording}
									title="Start Recording"
								>
									<i class="fas fa-microphone" />
									Start Recording
								</button>
							</Show>
						</div>
					</div>
				</Show>

				<Show when={audioURL()}>
					<div class={styles.playbackSection}>
						<div class={styles.audioPlayer}>
							<audio controls src={audioURL()!} class={styles.audio} />
						</div>
						<div class={styles.duration}>
							Duration: {formatTime(recordingTime())}
						</div>
						<button
							type="button"
							class={styles.rerecordButton}
							onClick={handleReset}
						>
							<i class="fas fa-redo mr-2" />
							Re-record
						</button>
					</div>
				</Show>
			</div>

			<div class={styles.actions}>
				<button
					type="button"
					onClick={handleCancel}
					class={styles.cancelButton}
				>
					Cancel
				</button>
				<button
					type="button"
					onClick={handleSave}
					class={styles.saveButton}
					disabled={!audioURL()}
				>
					<i class="fas fa-check mr-2" />
					Attach Voice Note
				</button>
			</div>
		</div>
	);
}
