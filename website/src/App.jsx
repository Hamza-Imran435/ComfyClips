import DownloadTool from './components/DownloadTool';
import Features from './components/Features';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Install from './components/Install';
import Navbar from './components/Navbar';
import PlatformStrip from './components/PlatformStrip';
import Troubleshoot from './components/Troubleshoot';

export default function App() {
  return (
    <div className="min-h-screen bg-paper font-body text-ink">
      <Navbar />
      <main>
        <Hero />
        <DownloadTool />
        <PlatformStrip />
        <Features />
        <Install />
        <Troubleshoot />
      </main>
      <Footer />
    </div>
  );
}
