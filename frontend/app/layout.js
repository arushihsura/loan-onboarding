'use client';

import './globals.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <ChatBot />
        </AuthProvider>
      </body>
    </html>
  );
}
