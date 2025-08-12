import { ReactNode, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {

  useEffect(() => {
    // Enable dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-deep-black text-white font-exo overflow-x-hidden">
      {/* Navigation */}
      <nav className="relative z-50 glassmorphism" style={{ borderBottom: '1px solid rgba(247, 147, 26, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {/* Cyberpunk geometric logo */}
              <div className="w-10 h-10 bg-gradient-to-br from-bitcoin to-electric rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white transform rotate-45"></div>
              </div>
              <span className="font-orbitron text-xl font-bold neon-text text-bitcoin">CHAMA</span>
            </div>


          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}
    </div>
  );
}
