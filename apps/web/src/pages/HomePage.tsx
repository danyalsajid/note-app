import { type Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import MainContent from '../components/notes/MainContent';
import TagFilter from '../components/ui/TagFilter';
import { useNavigation, useAuth } from '../contexts';

const HomePage: Component = () => {
	const navigation = useNavigation();
	const auth = useAuth();
	const navigate = useNavigate();
	const [isSidebarOpen, setIsSidebarOpen] = createSignal(false);

	const handleSearch = async (query: string) => {
		await navigation.searchNotes(query);
	};

	const handleLogout = async () => {
		await auth.logout();
		navigate('/login');
	};

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen());
	};

	const closeSidebar = () => {
		setIsSidebarOpen(false);
	};

	return (
		<div class="flex h-screen">
			<Sidebar isOpen={isSidebarOpen()} onClose={closeSidebar} />
			<div class="flex flex-col flex-1">
				<Header 
					onSearch={handleSearch} 
					onLogout={handleLogout}
					onMenuToggle={toggleSidebar}
				/>
				<TagFilter />
				<MainContent />
			</div>
		</div>
	);
};

export default HomePage;
