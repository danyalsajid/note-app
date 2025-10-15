import { type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import MainContent from '../components/notes/MainContent';
import { useNavigation, useAuth } from '../contexts';

const HomePage: Component = () => {
	const navigation = useNavigation();
	const auth = useAuth();
	const navigate = useNavigate();

	const handleSearch = async (query: string) => {
		await navigation.searchNotes(query);
	};

	const handleLogout = async () => {
		await auth.logout();
		navigate('/login');
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
