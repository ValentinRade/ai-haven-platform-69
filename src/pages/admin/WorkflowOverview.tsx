
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, BarChart2, LineChart, PieChart, Settings, Users, MessageSquare, Clock } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface WorkflowData {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  usageCount: number;
  successRate: number;
  lastUsed: string;
  tools: string[];
}

// Mock data for charts
const usageData = [
  { name: 'Mon', usage: 4000 },
  { name: 'Tue', usage: 3000 },
  { name: 'Wed', usage: 5000 },
  { name: 'Thu', usage: 2780 },
  { name: 'Fri', usage: 1890 },
  { name: 'Sat', usage: 2390 },
  { name: 'Sun', usage: 3490 },
];

const categoryData = [
  { name: 'Immobilien', value: 400 },
  { name: 'Finanz', value: 300 },
  { name: 'Support', value: 200 },
  { name: 'Sonstige', value: 100 },
];

const COLORS = ['#008242', '#545454', '#80cbc4', '#9e9e9e'];

const mockWorkflows: WorkflowData[] = [
  {
    id: '1',
    name: 'Immobilien Auskunft',
    status: 'active',
    usageCount: 1245,
    successRate: 94,
    lastUsed: '2023-06-15T15:32:00Z',
    tools: ['Suche', 'Datenbank', 'Dokumente']
  },
  {
    id: '2',
    name: 'Finanzdaten Analyse',
    status: 'active',
    usageCount: 876,
    successRate: 88,
    lastUsed: '2023-06-14T09:45:00Z',
    tools: ['Rechner', 'Datenbank']
  },
  {
    id: '3',
    name: 'Terminplanung',
    status: 'inactive',
    usageCount: 432,
    successRate: 76,
    lastUsed: '2023-06-10T11:20:00Z',
    tools: ['Kalender', 'E-Mail']
  },
  {
    id: '4',
    name: 'Dokument Analyse',
    status: 'active',
    usageCount: 654,
    successRate: 92,
    lastUsed: '2023-06-15T14:10:00Z',
    tools: ['Dokumente', 'Suche']
  }
];

const WorkflowOverview: React.FC = () => {
  const [workflows] = useState<WorkflowData[]>(mockWorkflows);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };
  
  const totalUsage = workflows.reduce((total, workflow) => total + workflow.usageCount, 0);
  const averageSuccessRate = Math.round(
    workflows.reduce((total, workflow) => total + workflow.successRate, 0) / workflows.length
  );
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Workflows</h2>
          <p className="text-gray-500">Übersicht und Statistiken aller AI Workflows</p>
        </div>
        <Button asChild>
          <Link to="/admin/workflow-builder" className="gap-2">
            <Plus size={18} />
            <span>Neuer Workflow</span>
          </Link>
        </Button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Aktive Workflows</p>
                <h3 className="text-3xl font-bold mt-1">{workflows.filter(w => w.status === 'active').length}</h3>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Settings size={24} />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <span className="text-primary font-medium">
                {Math.round((workflows.filter(w => w.status === 'active').length / workflows.length) * 100)}%
              </span> aller Workflows aktiv
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Gesamt Nutzung</p>
                <h3 className="text-3xl font-bold mt-1">{totalUsage.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <MessageSquare size={24} />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <span className="text-blue-600 font-medium">+12%</span> im Vergleich zum Vormonat
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Erfolgsrate</p>
                <h3 className="text-3xl font-bold mt-1">{averageSuccessRate}%</h3>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <BarChart2 size={24} />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <span className="text-amber-600 font-medium">+5%</span> im Vergleich zum Vormonat
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Aktive Nutzer</p>
                <h3 className="text-3xl font-bold mt-1">234</h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Users size={24} />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <span className="text-purple-600 font-medium">+18%</span> im Vergleich zum Vormonat
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-base font-medium">
              <LineChart size={18} className="mr-2 text-primary" />
              Nutzung über Zeit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={usageData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="usage" 
                    stroke="#008242" 
                    fill="url(#colorUsage)" 
                  />
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008242" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#008242" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base font-medium">
              <PieChart size={18} className="mr-2 text-primary" />
              Nutzung nach Kategorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Workflow Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Workflow Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Nutzung</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Erfolgsrate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Zuletzt verwendet</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tools</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">{workflow.name}</td>
                    <td className="py-4 px-4">
                      <span 
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          workflow.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {workflow.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="py-4 px-4">{workflow.usageCount.toLocaleString()}</td>
                    <td className="py-4 px-4">{workflow.successRate}%</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1 text-gray-400" />
                        <span>{formatDate(workflow.lastUsed)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {workflow.tools.map((tool, index) => (
                          <span 
                            key={index} 
                            className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Settings size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowOverview;
