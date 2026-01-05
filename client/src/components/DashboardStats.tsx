import { WorkLog } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText, TrendingUp, AlertOctagon } from "lucide-react";
import { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { format, subDays, isSameDay } from "date-fns";

interface DashboardStatsProps {
  logs: WorkLog[];
}

export function DashboardStats({ logs }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const totalHours = logs.reduce((acc, log) => acc + log.hoursSpent, 0);
    const totalLogs = logs.length;
    const totalIterations = logs.reduce((acc, log) => acc + log.iterations, 0);
    const issuesCount = logs.filter(l => l.issues && l.issues.length > 0).length;

    // Chart Data - Last 7 days
    const today = new Date();
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, 6 - i);
      const dayLogs = logs.filter(l => isSameDay(new Date(l.date), date));
      return {
        date: format(date, "MMM d"),
        hours: dayLogs.reduce((acc, l) => acc + l.hoursSpent, 0),
      };
    });

    return { totalHours, totalLogs, totalIterations, issuesCount, chartData };
  }, [logs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="shadow-sm border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
          <Clock className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Tracked across all logs
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Log Entries</CardTitle>
          <FileText className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLogs}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Documented tasks
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Iterations</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalIterations}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total refinement cycles
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/60 col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent className="h-[80px] p-0 pb-2 pr-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="hours" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorHours)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
