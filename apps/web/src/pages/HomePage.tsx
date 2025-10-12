import { type Component } from 'solid-js';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import MainContent from '../components/notes/MainContent';

const HomePage: Component = () => {
	const handleSearch = (query: string) => {
		console.log('Searching for:', query);
		// TODO: Implement search functionality
	};

	const handleLogout = () => {
		console.log('Logging out...');
		// TODO: Implement logout functionality
	};

	return (
		<div class="flex h-screen">
			<Sidebar />
			<div class="flex flex-col flex-1">
				<Header onSearch={handleSearch} onLogout={handleLogout} />
				<MainContent />
			</div>
		</div>
	);
};

export default HomePage;
