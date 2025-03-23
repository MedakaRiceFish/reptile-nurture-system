
import React from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { StatCard } from "@/components/ui/dashboard/StatCard";
import { EnclosureList } from "@/components/ui/dashboard/EnclosureList";
import { SensorChart } from "@/components/ui/dashboard/SensorChart";
import { QuickActions } from "@/components/ui/dashboard/QuickActions";
import { UpcomingSchedule } from "@/components/ui/dashboard/UpcomingSchedule";
import { Thermometer, Droplet, Bell, Clock } from "lucide-react";

const Dashboard = () => {
  return (
    <MainLayout pageTitle="Dashboard">
      <div className="max-w-[1600px] mx-auto animate-fade-up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Average Temperature"
            value="82°F"
            icon={<Thermometer className="w-6 h-6" />}
            change={{
              value: "2.5°F",
              positive: true,
            }}
          />
          <StatCard
            title="Average Humidity"
            value="64%"
            icon={<Droplet className="w-6 h-6" />}
            change={{
              value: "5%",
              positive: false,
            }}
          />
          <StatCard
            title="Active\nAlerts"
            value="3"
            icon={<Bell className="w-6 h-6" />}
            isAlert={true}
            linkTo="/alerts"
          />
          <StatCard
            title="Upcoming\nTasks"
            value="4"
            icon={<Clock className="w-6 h-6" />}
          />
        </div>

        <div className="mb-8">
          <SensorChart />
        </div>

        <div className="mb-8">
          <EnclosureList />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActions />
          <UpcomingSchedule />
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
