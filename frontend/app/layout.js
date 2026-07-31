import './globals.css';

export const metadata = {
  title: 'Katips - Katipunan Central Hub',
  description: 'Katips is the official digital platform of the Sangguniang Kabataan, serving as a centralized hub for the youth of Katipunan. Access community forums, news, services, and earn rewards through SKill Up.',
  keywords: 'Katips, Katipunan, SK, Sangguniang Kabataan, youth portal, community hub',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7C3AED" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
