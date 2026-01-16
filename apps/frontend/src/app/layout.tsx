import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web Service',
  description: 'Next.js + Express Web Service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
