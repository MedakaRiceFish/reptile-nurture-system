
import React from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { EnvironmentContainer } from "@/components/environment/EnvironmentContainer";

export default function Environment() {
  return (
    <MainLayout pageTitle="Enclosure">
      <EnvironmentContainer />
    </MainLayout>
  );
}
