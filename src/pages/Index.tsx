
import React from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { StatCard } from "@/components/ui/dashboard/StatCard";
import { EnclosureList } from "@/components/ui/dashboard/EnclosureList";
import { SensorChart } from "@/components/ui/dashboard/SensorChart";
import { QuickActions } from "@/components/ui/dashboard/QuickActions";
import { UpcomingSchedule } from "@/components/ui/dashboard/UpcomingSchedule";
import { Bell, Clock, Turtle, TreeDeciduous } from "lucide-react";

const Dashboard = () => {
  return (
    <MainLayout pageTitle="Home">
      <div className="max-w-[1600px] mx-auto animate-fade-up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="ENCLOSURES"
            value="8"
            icon={<TreeDeciduous className="w-6 h-6" />}
            linkTo="/enclosures"
          />
          <StatCard
            title="ANIMALS"
            value="12"
            icon={<Turtle className="w-6 h-6" />}
            linkTo="/animals"
          />
          <StatCard
            title="ACTIVE ALERTS"
            value="3"
            icon={<Bell className="w-6 h-6" />}
            isAlert={true}
            linkTo="/alerts"
          />
          <StatCard
            title="UPCOMING TASKS"
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
