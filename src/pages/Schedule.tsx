
import React from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";

const Schedule = () => {
  return (
    <MainLayout pageTitle="Schedule">
      <div className="max-w-[1600px] mx-auto animate-fade-up">
        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Task Scheduling</h2>
          <p className="text-muted-foreground">
            This page will provide scheduling and task management features.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Schedule;
