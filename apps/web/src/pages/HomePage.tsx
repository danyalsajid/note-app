import { type Component } from 'solid-js';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import MainContent from '../components/notes/MainContent';
import { useNavigation } from '../contexts';

const HomePage: Component = () => {
	const navigation = useNavigation();

	const handleSearch = async (query: string) => {
		await navigation.searchNotes(query);
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
