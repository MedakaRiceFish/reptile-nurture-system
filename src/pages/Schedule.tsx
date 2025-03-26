import React, { useState } from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { useTasks } from "@/hooks/useTasks";
import { format, parseISO, isToday, isTomorrow, isPast, addDays } from "date-fns";
import { Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/task/AddTaskDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TaskGroup } from "@/components/task/list/TaskGroup";
import { EmptyTaskList } from "@/components/task/list/EmptyTaskList";
import { DeleteTaskDialog } from "@/components/task/DeleteTaskDialog";

const Schedule = () => {
  const { tasks, isLoading, addTask, completeTask, removeTask, refreshTasks } = useTasks(100);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, taskId: string | null }>({ open: false, taskId: null });

  // Filtered tasks based on view mode
  const filteredTasks = tasks.filter(task => {
    const dueDate = parseISO(task.due_date);
    
    switch (viewMode) {
      case 'today':
        return isToday(dueDate);
      case 'upcoming':
        return !isPast(dueDate) || isToday(dueDate);
      case 'overdue':
        return isPast(dueDate) && !isToday(dueDate);
      default:
        return true;
    }
  });

  // Group tasks by date
  const groupedTasks: Record<string, typeof tasks> = {};
  
  filteredTasks.forEach(task => {
    const dueDate = task.due_date;
    if (!groupedTasks[dueDate]) {
      groupedTasks[dueDate] = [];
    }
    groupedTasks[dueDate].push(task);
  });

  // Sort dates
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    return parseISO(a).getTime() - parseISO(b).getTime();
  });

  const handleDeleteTask = (taskId: string) => {
    setDeleteDialog({ open: true, taskId });
  };

  const confirmDeleteTask = async () => {
    if (deleteDialog.taskId) {
      await removeTask(deleteDialog.taskId);
      setDeleteDialog({ open: false, taskId: null });
    }
  };

  const handleAddTask = async (taskData: any) => {
    await addTask(taskData);
    refreshTasks();
  };

  const handleComplete = async (taskId: string) => {
    await completeTask(taskId);
    refreshTasks();
  };

  const renderTasks = (tasks: typeof filteredTasks) => {
    const grouped: Record<string, typeof tasks> = {};
    tasks.forEach(task => {
      const dueDate = task.due_date;
      if (!grouped[dueDate]) {
        grouped[dueDate] = [];
      }
      grouped[dueDate].push(task);
    });

    const dates = Object.keys(grouped).sort((a, b) => {
      return parseISO(a).getTime() - parseISO(b).getTime();
    });

    return dates.length > 0 ? (
      dates.map(date => (
        <TaskGroup 
          key={date} 
          date={date} 
          tasks={grouped[date]} 
          onComplete={handleComplete}
          onDelete={handleDeleteTask}
        />
      ))
    ) : (
      <EmptyTaskList onAddTask={() => setDialogOpen(true)} />
    );
  };

  return (
    <MainLayout pageTitle="Schedule">
      <div className="max-w-[1600px] mx-auto animate-fade-up">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">Manage your tasks and schedule</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add New Task
          </Button>
        </div>

        <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => setViewMode(value as any)}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Sort by Date</DropdownMenuItem>
                <DropdownMenuItem>Sort by Priority</DropdownMenuItem>
                <DropdownMenuItem>Filter by Type</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <TabsContent value="all" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading tasks...</p>
              </div>
            ) : (
              renderTasks(filteredTasks)
            )}
          </TabsContent>

          <TabsContent value="today" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading tasks...</p>
              </div>
            ) : (
              renderTasks(tasks.filter(task => isToday(parseISO(task.due_date))))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading tasks...</p>
              </div>
            ) : (
              renderTasks(tasks.filter(task => !isPast(parseISO(task.due_date)) || isToday(parseISO(task.due_date))))
            )}
          </TabsContent>

          <TabsContent value="overdue" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading tasks...</p>
              </div>
            ) : (
              renderTasks(tasks.filter(task => isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date))))
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <AddTaskDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onTaskAdded={handleAddTask}
      />
      
      <DeleteTaskDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={confirmDeleteTask}
      />
    </MainLayout>
  );
};

export default Schedule;
