import { Suspense } from 'react';

import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <DashboardLayout>
      <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
    </DashboardLayout>
  );
}
