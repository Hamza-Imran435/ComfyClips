// import DownloadTool from './components/DownloadTool'; // disabled until the download server is deployed somewhere that can actually run it
import Features from './components/Features';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Install from './components/Install';
import Navbar from './components/Navbar';
import PlatformStrip from './components/PlatformStrip';

export default function App() {
  return (
    <div className="min-h-screen bg-paper font-body text-ink">
      <Navbar />
      <main>
        <Hero />
        {/* <DownloadTool /> */}
        <PlatformStrip />
        <Features />
        <Install />
      </main>
      <Footer />
    </div>
  );
}
