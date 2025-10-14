import axios from 'axios';

class AIService {
	private initializeAI() {
		// No initialization needed for Hugging Face API
		return true;
	}

	async summarizeContent(content: string): Promise<string> {
		try {
			this.initializeAI();

			const apiKey = process.env.HF_API_KEY;
			if (!apiKey) {
				throw new Error('HF_API_KEY is not configured in environment variables');
			}

			console.log('Trying to summarize note content...');

			// Use Hugging Face API for summarization
			const response = await axios.post(
				'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
				{
					inputs: content,
					parameters: {
						max_length: 150,
						min_length: 30,
						do_sample: false,
					},
				},
				{
					headers: {
						Authorization: `Bearer ${apiKey}`,
						'Content-Type': 'application/json',
					},
				}
			);

			const summary = response.data[0]?.summary_text || response.data?.summary_text || '';

			return summary.trim();
		} catch (error) {
			console.error('Error summarizing content:', error);
			throw new Error('Failed to summarize note content');
		}
	}
}

export const aiService = new AIService();
