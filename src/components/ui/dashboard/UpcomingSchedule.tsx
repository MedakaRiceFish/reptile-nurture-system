
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Utensils, Clipboard, Syringe } from "lucide-react";

interface ScheduleItemProps {
  title: string;
  time: string;
  date: string;
  type: "feeding" | "cleaning" | "health" | "other";
}

const scheduleItems: ScheduleItemProps[] = [
  {
    title: "Feed Leopard Gecko",
    time: "7:00 PM",
    date: "Today",
    type: "feeding",
  },
  {
    title: "Clean Python Enclosure",
    time: "10:00 AM",
    date: "Tomorrow",
    type: "cleaning",
  },
  {
    title: "Vet Checkup - Bearded Dragon",
    time: "3:30 PM",
    date: "Sep 28",
    type: "health",
  },
  {
    title: "Supplement Calcium - Gecko",
    time: "8:00 PM",
    date: "Sep 29",
    type: "feeding",
  },
];

function ScheduleItem({ title, time, date, type }: ScheduleItemProps) {
  const getIcon = () => {
    switch (type) {
      case "feeding":
        return <Utensils className="h-4 w-4" />;
      case "cleaning":
        return <Clipboard className="h-4 w-4" />;
      case "health":
        return <Syringe className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case "feeding":
        return "bg-amber-100 text-amber-800";
      case "cleaning":
        return "bg-blue-100 text-blue-800";
      case "health":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="flex items-center p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className={`${getColor()} p-2 rounded-lg mr-3`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Clock className="h-3 w-3 mr-1" />
          <span className="mr-2">{time}</span>
          <Calendar className="h-3 w-3 mr-1" />
          <span>{date}</span>
        </div>
      </div>
      <button className="text-xs text-reptile-500 hover:text-reptile-600 font-medium ml-2">
        Complete
      </button>
    </div>
  );
}

export function UpcomingSchedule() {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Upcoming Schedule</span>
          <button className="text-xs px-2 py-1 bg-reptile-50 text-reptile-600 rounded-md font-medium hover:bg-reptile-100 transition-colors">
            + Add Task
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {scheduleItems.map((item, i) => (
            <ScheduleItem key={i} {...item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
