"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <Card className="border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700">{title}</CardTitle>
        <div className="rounded-lg bg-gradient-to-br from-[#00457C] to-[#0066B3] p-2.5">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#00457C]">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs font-semibold mt-1", 
            trendUp ? "text-green-700" : "text-red-700"
          )}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
