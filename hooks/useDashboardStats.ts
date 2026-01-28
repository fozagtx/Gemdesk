import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  teamMembers: number;
  gemExecutions: number;
  organizationName: string;
  organizationImage?: string;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch('/api/dashboard/stats');

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }

  return response.json();
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}