
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/ui/layout/MainLayout";
import { useTasks } from "@/hooks/useTasks";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { 
  Calendar, 
  Plus, 
  Filter, 
  Check, 
  Trash2, 
  CheckSquare, 
  Square,
  ChevronRight,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/task/AddTaskDialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Task } from "@/types/task";

const Tasks = () => {
  const navigate = useNavigate();
  const { 
    tasks, 
    isLoading, 
    addTask, 
    completeTask, 
    completeTasks,
    removeTask, 
    removeTasks,
    fetchAllTasks,
    selectedTaskIds,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    viewTaskDetails
  } = useTasks(100);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, taskIds: string[] }>({ 
    open: false, 
    taskIds: [] 
  });
  const [completeDialog, setCompleteDialog] = useState<{ open: boolean, taskIds: string[] }>({
    open: false,
    taskIds: []
  });

  useEffect(() => {
    fetchAllTasks();
  }, [fetchAllTasks]);

  // Filtered tasks based on view mode
  const filteredTasks = tasks.filter(task => {
    const dueDate = parseISO(task.due_date);
    
    switch (viewMode) {
      case 'today':
        return isToday(dueDate);
      case 'upcoming':
        return !isPast(dueDate) || isToday(dueDate);
      case 'overdue':
        return isPast(dueDate) && !isToday(dueDate) && task.status === 'pending';
      default:
        return true;
    }
  });

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      
      if (isToday(date)) {
        return "Today";
      } else if (isTomorrow(date)) {
        return "Tomorrow";
      } else {
        return format(date, "MMM d, yyyy");
      }
    } catch (error) {
      return dateString;
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
    fetchAllTasks();
  };

  const handleDeleteTask = (taskId: string) => {
    setDeleteDialog({ open: true, taskIds: [taskId] });
  };

  const handleDeleteSelectedTasks = () => {
    if (selectedTaskIds.length === 0) return;
    setDeleteDialog({ open: true, taskIds: selectedTaskIds });
  };

  const confirmDeleteTasks = async () => {
    if (deleteDialog.taskIds.length === 1) {
      await removeTask(deleteDialog.taskIds[0]);
    } else {
      await removeTasks(deleteDialog.taskIds);
    }
    setDeleteDialog({ open: false, taskIds: [] });
  };

  const handleComplete = async (taskId: string) => {
    await completeTask(taskId);
    fetchAllTasks();
  };

  const handleCompleteSelectedTasks = () => {
    if (selectedTaskIds.length === 0) return;
    setCompleteDialog({ open: true, taskIds: selectedTaskIds });
  };

  const confirmCompleteTasks = async () => {
    await completeTasks(completeDialog.taskIds);
    setCompleteDialog({ open: false, taskIds: [] });
  };

  const handleRowClick = (e: React.MouseEvent, task: Task) => {
    // Don't navigate if they clicked the checkbox
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/tasks/${task.id}`);
  };

  const isAllSelected = filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length;
  const hasSomeSelected = selectedTaskIds.length > 0;

  return (
    <MainLayout pageTitle="Tasks">
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
            
            <div className="flex items-center gap-2">
              {hasSomeSelected && (
                <div className="flex items-center gap-2 mr-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCompleteSelectedTasks}
                    className="text-green-600"
                  >
                    <Check className="mr-1 h-4 w-4" /> 
                    Complete
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDeleteSelectedTasks}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> 
                    Delete
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                </div>
              )}
              
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
          </div>

          <TabsContent value="all" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading tasks...</p>
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="bg-card rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={isAllSelected}
                          onCheckedChange={() => {
                            if (isAllSelected) {
                              clearSelection();
                            } else {
                              selectAllTasks();
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead className="w-[120px]">Priority</TableHead>
                      <TableHead className="w-[150px]">Due Date</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow 
                        key={task.id} 
                        className="cursor-pointer hover:bg-muted/80"
                        onClick={(e) => handleRowClick(e, task)}
                      >
                        <TableCell className="p-2">
                          <Checkbox 
                            checked={selectedTaskIds.includes(task.id)}
                            onCheckedChange={() => toggleTaskSelection(task.id)}
                            onClick={(e) => e.stopPropagation()} // Prevent row click
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium truncate">{task.title}</p>
                            {task.description && (
                              <p className="text-muted-foreground text-xs truncate mt-1 max-w-md">
                                {task.description.length > 100
                                  ? `${task.description.slice(0, 100)}...`
                                  : task.description}
                              </p>
                            )}
                            {task.related_type && (
                              <Badge variant="outline" className="mt-1 capitalize text-xs">
                                {task.related_type}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center text-sm">
                              <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                              <span>{formatDate(task.due_date)}</span>
                            </div>
                            {task.due_time && (
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <Clock className="mr-1 h-3 w-3" />
                                <span>{task.due_time}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {task.status === 'completed' ? (
                            <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
                          ) : isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date)) ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {task.status !== 'completed' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleComplete(task.id);
                                }}
                                className="h-8 w-8 text-green-600"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/tasks/${task.id}`);
                              }}
                              className="h-8 w-8"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
              Are you sure you want to delete {deleteDialog.taskIds.length > 1 
                ? `these ${deleteDialog.taskIds.length} tasks` 
                : 'this task'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, taskIds: [] })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTasks}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={completeDialog.open} onOpenChange={(open) => setCompleteDialog({ ...completeDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Completion</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark {completeDialog.taskIds.length > 1 
                ? `these ${completeDialog.taskIds.length} tasks` 
                : 'this task'} as complete?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialog({ open: false, taskIds: [] })}>
              Cancel
            </Button>
            <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={confirmCompleteTasks}>
              <Check className="mr-2 h-4 w-4" /> Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Tasks;
