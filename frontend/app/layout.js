import './globals.css';

export const metadata = {
  title: 'Loan Video Verification',
  description: 'Get instant personal loan with quick video verification'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
