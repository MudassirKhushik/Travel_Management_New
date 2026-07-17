// app/portal/page.js - Direct dashboard access (no auth for now)
import DashboardLayout from '@/components/portal/DashboardLayout';
import DashboardOverview from '@/components/portal/DashboardOverview';

export default function PortalPage() {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}