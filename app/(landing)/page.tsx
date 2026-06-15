import Link from "next/link";
import Image from "next/image";
import { FaPlay, FaRobot, FaWaveSquare, FaPalette, FaMusic } from "react-icons/fa";
import { BsRobot, BsSoundwave } from "react-icons/bs";

export default function LandingPage() {
  return (
    <div className="bg-black min-h-screen text-white overflow-y-auto custom-scrollbar">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 md:px-12 w-full z-50">
        <div className="flex items-center gap-x-2">
          <Image src="/images/liked.png" alt="Logo" width={40} height={40} className="rounded-full" />
          <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            VibeTribe
          </p>
        </div>
        <div className="flex gap-x-4">
          <Link
            href="/listen"
            className="bg-white text-black font-semibold py-2 px-6 rounded-full hover:scale-105 transition"
          >
            Launch Web Player
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center mt-20 md:mt-32 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl">
          The future of <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">music listening</span> is here.
        </h1>
        <p className="text-neutral-400 mt-6 text-lg md:text-xl max-w-2xl">
          Experience your favorite tracks like never before with AI-powered DJs, 
          BPM Analysis, and generative cover art. Ad-free, uninterrupted, pure vibes.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/listen"
            className="bg-emerald-500 text-black font-bold py-4 px-10 rounded-full hover:bg-emerald-400 hover:scale-105 transition flex items-center gap-x-2 shadow-lg shadow-emerald-500/20"
          >
            <FaMusic /> Open Web Player
          </Link>
        </div>

        {/* Hero Image Mockup (CSS only to look cool) */}
        <div className="mt-20 w-full max-w-5xl rounded-t-xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden pt-4 px-4 flex flex-col items-center relative" style={{ height: "400px" }}>
          <div className="absolute top-0 w-full h-full bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
          <div className="w-full bg-black/50 rounded-t-lg border border-neutral-800 h-full p-6 backdrop-blur-md">
             <div className="flex gap-x-4 animate-pulse mb-8">
               <div className="w-12 h-12 rounded-md bg-neutral-800" />
               <div className="flex flex-col gap-y-2 justify-center">
                 <div className="w-32 h-4 bg-neutral-800 rounded-full" />
                 <div className="w-20 h-3 bg-neutral-800 rounded-full" />
               </div>
             </div>
             <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
               <div className="w-1/3 h-full bg-emerald-500 rounded-full" />
             </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-neutral-900 py-24 px-6 md:px-12 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            Not just another <br /> Spotify clone.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-black/40 border border-neutral-800 p-8 rounded-2xl hover:bg-black/60 transition group">
              <div className="bg-emerald-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <BsRobot size={24} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Voice DJ</h3>
              <p className="text-neutral-400 leading-relaxed">
                Tired of typing? Just speak. Ask our cutting-edge Whisper AI to play any song or playlist instantly using just your voice.
              </p>
            </div>

            <div className="bg-black/40 border border-neutral-800 p-8 rounded-2xl hover:bg-black/60 transition group">
              <div className="bg-cyan-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <BsSoundwave size={24} className="text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">BPM Analysis</h3>
              <p className="text-neutral-400 leading-relaxed">
                Every track you upload is automatically analyzed for exact BPM and audio features so you can mix your sets perfectly.
              </p>
            </div>

            <div className="bg-black/40 border border-neutral-800 p-8 rounded-2xl hover:bg-black/60 transition group">
              <div className="bg-purple-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <FaPalette size={24} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Generative Covers</h3>
              <p className="text-neutral-400 leading-relaxed">
                Missing cover art? Our AI instantly generates stunning, unique geometric artwork for your songs completely automatically.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to tune in?</h2>
        <p className="text-neutral-400 text-lg mb-10">Join thousands of users enjoying high-fidelity music streaming.</p>
        <Link
            href="/listen"
            className="bg-white text-black font-bold py-4 px-12 rounded-full hover:scale-105 transition shadow-xl"
          >
            Get Started For Free
        </Link>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-neutral-800 py-10 text-center text-neutral-500">
        <p>© 2026 VibeTribe. All rights reserved.</p>
      </footer>
    </div>
  );
}
