
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Users, Clock, AlertCircle } from "lucide-react";

const data = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 19 },
  { name: 'Wed', value: 15 },
  { name: 'Thu', value: 22 },
  { name: 'Fri', value: 18 },
  { name: 'Sat', value: 24 },
  { name: 'Sun', value: 21 },
];

const stats = [
  {
    title: "Active Projects",
    value: "12",
    icon: BarChart3,
    change: "+2.5%",
    description: "vs last month"
  },
  {
    title: "Team Members",
    value: "24",
    icon: Users,
    change: "+5.0%",
    description: "vs last month"
  },
  {
    title: "Hours Logged",
    value: "164",
    icon: Clock,
    change: "+1.2%",
    description: "vs last week"
  },
  {
    title: "Pending Tasks",
    value: "8",
    icon: AlertCircle,
    change: "-3.0%",
    description: "vs yesterday"
  }
];

const projects = [
  {
    name: "Website Redesign",
    progress: 75,
    status: "In Progress"
  },
  {
    name: "Mobile App Development",
    progress: 45,
    status: "On Track"
  },
  {
    name: "Marketing Campaign",
    progress: 90,
    status: "Near Completion"
  }
];

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening today.</p>
        </div>

        <div className="dashboard-grid">
          {stats.map((stat) => (
            <Card key={stat.title} className="stat-card hover:shadow-lg transition-all duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                </div>
                <div className="p-2 bg-primary/5 rounded-full">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
                <span className="text-sm text-muted-foreground">{stat.description}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
            <div className="space-y-6">
              {projects.map((project) => (
                <div key={project.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-sm text-muted-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <span className="text-sm text-muted-foreground">{project.status}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
