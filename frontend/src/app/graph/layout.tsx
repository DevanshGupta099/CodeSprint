import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DAG Studio',
  description: 'Veritas Multi-Tier Supply Chain Dependency Network & Disruption Propagation',
};

export default function GraphLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
