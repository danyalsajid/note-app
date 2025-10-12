import { type Component } from 'solid-js';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './mainContent';

const Layout: Component = () => {
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

export default Layout;
