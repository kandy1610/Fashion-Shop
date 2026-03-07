import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Chatbot from './Chatbot';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
