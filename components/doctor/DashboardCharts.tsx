'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardChartsProps {
  type: 'area' | 'pie';
  data?: any[];
}

export default function DashboardCharts({ type, data = [] }: DashboardChartsProps) {
  // Fallback if no data provided
  const chartData = data.length > 0 ? data : [
    { name: 'Mon', count: 0 },
    { name: 'Tue', count: 0 },
    { name: 'Wed', count: 0 },
    { name: 'Thu', count: 0 },
    { name: 'Fri', count: 0 },
    { name: 'Sat', count: 0 },
    { name: 'Sun', count: 0 },
  ];

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorConsult" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorConsult)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return null;
}
