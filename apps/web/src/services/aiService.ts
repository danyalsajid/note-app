const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class AIService {
	/**
	 * Summarize note content
	 */
	async summarizeContent(content: string): Promise<string> {
		if (content.length < 50) {
			throw new Error('Content must be at least 50 characters long to summarize.');
		}
		try {
			const response = await fetch(`${API_BASE_URL}/notes/summarize`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ content }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to summarize content');
			}

			const data = await response.json();
			return data.summary;
		} catch (error) {
			console.error('Error summarizing content:', error);
			throw new Error('Failed to summarize note content');
		}
	}
}

export const aiService = new AIService();
