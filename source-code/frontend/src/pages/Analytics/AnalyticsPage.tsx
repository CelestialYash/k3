import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/client';
import type { DashboardStats } from '../../types';

const COLORS = ['#004ac6', '#006d30', '#a65900', '#6e3900', '#2563eb', '#434655'];

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get<DashboardStats>('/analytics/dashboard').then((res) => setStats(res.data));
  }, []);

  const catData = stats
    ? Object.entries(stats.category_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-[28px] font-bold text-on-surface">Analytics & Insights</h1>
        <p className="text-[16px] text-on-surface-variant">
          Repository coverage, extraction throughput, and verification metrics across CMPDI records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
          <h2 className="font-headline text-[18px] font-semibold mb-4">Documents by Category</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#004ac6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm">
          <h2 className="font-headline text-[18px] font-semibold mb-4">Repository Share</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                  {catData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
