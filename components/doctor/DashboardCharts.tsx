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

const data = [
  { name: 'Mon', consultations: 12, efficiency: 85 },
  { name: 'Tue', consultations: 19, efficiency: 92 },
  { name: 'Wed', consultations: 15, efficiency: 88 },
  { name: 'Thu', consultations: 22, efficiency: 95 },
  { name: 'Fri', consultations: 30, efficiency: 98 },
  { name: 'Sat', consultations: 10, efficiency: 80 },
  { name: 'Sun', consultations: 8, efficiency: 75 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

interface DashboardChartsProps {
  type: 'area' | 'pie';
}

export default function DashboardCharts({ type }: DashboardChartsProps) {
  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorConsult" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
            dataKey="consultations" 
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
