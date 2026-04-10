import './globals.css';

export const metadata = {
  title: 'J.A.R.V.I.S. HQ — Command Center',
  description: "Joon's Personal Command Center",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
