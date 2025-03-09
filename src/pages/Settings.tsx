
import React from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";

const Settings = () => {
  return (
    <MainLayout pageTitle="Settings">
      <div className="max-w-[1600px] mx-auto animate-fade-up">
        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">System Settings</h2>
          <p className="text-muted-foreground">
            This page will provide application configuration options.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
