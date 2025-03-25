
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { Task } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/context/AuthContext";
import { format, parseISO, isToday, isTomorrow, isPast, addDays } from "date-fns";
import { Calendar, Clock, AlertCircle, Check, X, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTaskDialog } from "@/components/task/AddTaskDialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Schedule = () => {
  const { user } = useAuth();
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
  const groupedTasks: Record<string, Task[]> = {};
  
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

  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return "Today";
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    } else if (isPast(date) && !isToday(date)) {
      return `Overdue - ${format(date, "MMMM d, yyyy")}`;
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setDeleteDialog({ open: true, taskId });
  };

  const confirmDeleteTask = async () => {
    if (deleteDialog.taskId) {
      await removeTask(deleteDialog.taskId);
      setDeleteDialog({ open: false, taskId: null });
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
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
            ) : sortedDates.length > 0 ? (
              sortedDates.map(date => (
                <div key={date} className="mb-6">
                  <div className="flex items-center mb-2">
                    <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                    <h2 className={`text-lg font-semibold ${isPast(parseISO(date)) && !isToday(parseISO(date)) ? 'text-destructive' : ''}`}>
                      {formatDateHeader(date)}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedTasks[date].map(task => (
                      <Card key={task.id} className={`overflow-hidden ${isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date)) ? 'border-destructive/40' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{task.title}</CardTitle>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <CardDescription className="flex items-center mt-1">
                            <Clock className="mr-1 h-3 w-3" />
                            {task.due_time || "Any time"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          {task.related_type && (
                            <Badge variant="outline" className="mt-2">
                              {task.related_type}
                            </Badge>
                          )}
                        </CardContent>
                        <CardFooter className="pt-2 flex justify-between">
                          <Button variant="ghost" size="sm" onClick={() => handleComplete(task.id)}>
                            <Check className="mr-1 h-4 w-4" /> Complete
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                            <X className="mr-1 h-4 w-4" /> Delete
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No tasks found</h3>
                <p className="text-muted-foreground mt-1">
                  Add a new task to get started
                </p>
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Task
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="today" className="mt-0">
            {/* Same content structure as "all" tab but filtered for today */}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            {/* Same content structure as "all" tab but filtered for upcoming */}
          </TabsContent>

          <TabsContent value="overdue" className="mt-0">
            {/* Same content structure as "all" tab but filtered for overdue */}
          </TabsContent>
        </Tabs>
      </div>
      
      <AddTaskDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onTaskAdded={handleAddTask}
      />
      
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, taskId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Schedule;
