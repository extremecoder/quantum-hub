import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Quantum Hub - Quantum Application Marketplace',
  description: 'Discover, deploy, and run quantum applications on real quantum hardware',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white shadow-sm dark:bg-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  Quantum Hub
                </span>
              </div>
              <nav className="hidden md:block">
                <ul className="flex space-x-8">
                  <li>
                    <a
                      href="/marketplace"
                      className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                    >
                      Marketplace
                    </a>
                  </li>
                  <li>
                    <a
                      href="/hardware"
                      className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                    >
                      Hardware
                    </a>
                  </li>
                  <li>
                    <a
                      href="/dashboard"
                      className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                    >
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a
                      href="/docs"
                      className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                    >
                      Documentation
                    </a>
                  </li>
                </ul>
              </nav>
              <div className="flex items-center space-x-4">
                <button className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                  Sign In
                </button>
                <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main>{children}</main>
        
        <footer className="bg-gray-100 py-12 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <div>
                <h3 className="mb-4 text-lg font-semibold dark:text-white">Quantum Hub</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  The premier marketplace for quantum applications and development tools.
                </p>
              </div>
              <div>
                <h3 className="mb-4 text-lg font-semibold dark:text-white">Resources</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li><a href="/docs" className="hover:text-indigo-600 dark:hover:text-indigo-400">Documentation</a></li>
                  <li><a href="/tutorials" className="hover:text-indigo-600 dark:hover:text-indigo-400">Tutorials</a></li>
                  <li><a href="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400">Blog</a></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 text-lg font-semibold dark:text-white">Company</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li><a href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400">About</a></li>
                  <li><a href="/careers" className="hover:text-indigo-600 dark:hover:text-indigo-400">Careers</a></li>
                  <li><a href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 text-lg font-semibold dark:text-white">Legal</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li><a href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400">Terms of Service</a></li>
                  <li><a href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
              <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                &copy; {new Date().getFullYear()} Quantum Hub. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
} 