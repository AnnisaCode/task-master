
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Task {
  id: string;
  content: string;
  assignee?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface Project {
  id: string;
  name: string;
  progress: number;
  status: string;
  team: string[];
  deadline: string;
}

interface Template {
  id: string;
  name: string;
  deadline: string;
  tasks: number;
}

const initialTemplates: Template[] = [
  { id: "1", name: "Website Development", deadline: "2 months", tasks: 12 },
  { id: "2", name: "Mobile App", deadline: "3 months", tasks: 15 },
  { id: "3", name: "Marketing Campaign", deadline: "1 month", tasks: 8 },
];

const initialProjects: Project[] = [
  { 
    id: "1",
    name: "E-commerce Platform", 
    progress: 75, 
    status: "In Progress",
    team: ["John D.", "Sarah M."],
    deadline: "2024-05-15"
  },
  { 
    id: "2",
    name: "Mobile App v2", 
    progress: 45, 
    status: "On Track",
    team: ["Mike R.", "Lisa K."],
    deadline: "2024-06-20"
  },
  { 
    id: "3",
    name: "Brand Redesign", 
    progress: 90, 
    status: "Near Completion",
    team: ["Tom B.", "Anna P."],
    deadline: "2024-04-30"
  },
];

const initialColumns: { [key: string]: Column } = {
  todo: {
    id: 'todo',
    title: 'To Do',
    tasks: [
      { id: 't1', content: 'Research competitors' },
      { id: 't2', content: 'Design wireframes' },
      { id: 't3', content: 'Setup development environment' }
    ]
  },
  inProgress: {
    id: 'inProgress',
    title: 'In Progress',
    tasks: [
      { id: 't4', content: 'Homepage development' },
      { id: 't5', content: 'User authentication' }
    ]
  },
  review: {
    id: 'review',
    title: 'Review',
    tasks: [
      { id: 't6', content: 'Code review' },
      { id: 't7', content: 'UI/UX review' }
    ]
  },
  done: {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: 't8', content: 'Project setup' },
      { id: 't9', content: 'Requirements gathering' }
    ]
  }
};

const Projects = () => {
  const [columns, setColumns] = useState<{ [key: string]: Column }>(
    JSON.parse(localStorage.getItem('kanbanColumns') || JSON.stringify(initialColumns))
  );
  const [projects, setProjects] = useState<Project[]>(
    JSON.parse(localStorage.getItem('projects') || JSON.stringify(initialProjects))
  );
  const [templates] = useState<Template[]>(initialTemplates);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDeadline, setNewProjectDeadline] = useState('');

  useEffect(() => {
    localStorage.setItem('kanbanColumns', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const task = sourceColumn.tasks.find(t => t.id === draggableId);

    if (!task) return;

    const newSourceTasks = [...sourceColumn.tasks];
    newSourceTasks.splice(source.index, 1);

    const newDestTasks = [...destColumn.tasks];
    newDestTasks.splice(destination.index, 0, task);

    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        tasks: newSourceTasks
      },
      [destination.droppableId]: {
        ...destColumn,
        tasks: newDestTasks
      }
    });

    toast.success('Task moved successfully');
  };

  const handleAddTask = () => {
    if (!selectedColumn || !newTaskContent.trim()) return;

    const newTask: Task = {
      id: `t${Date.now()}`,
      content: newTaskContent
    };

    setColumns({
      ...columns,
      [selectedColumn]: {
        ...columns[selectedColumn],
        tasks: [...columns[selectedColumn].tasks, newTask]
      }
    });

    setNewTaskContent('');
    setSelectedColumn(null);
    toast.success('Task added successfully');
  };

  const handleCreateProject = () => {
    if (!newProjectName || !newProjectDeadline) {
      toast.error('Please fill in all fields');
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      progress: 0,
      status: 'Not Started',
      team: [],
      deadline: newProjectDeadline
    };

    setProjects([...projects, newProject]);
    setNewProjectName('');
    setNewProjectDeadline('');
    toast.success('Project created successfully');
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    toast.success('Project deleted successfully');
  };

  const handleUseTemplate = (template: Template) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: template.name,
      progress: 0,
      status: 'Not Started',
      team: [],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setProjects([...projects, newProject]);
    toast.success('Project created from template');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Projects</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newProjectDeadline}
                    onChange={(e) => setNewProjectDeadline(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateProject} className="w-full">
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Project Templates */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Project Templates</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">Duration: {template.deadline}</p>
                    <p className="text-sm text-muted-foreground">Tasks: {template.tasks}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleUseTemplate(template)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Active Projects */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Projects</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">Deadline: {project.deadline}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => toast.info('Edit feature coming soon')}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteProject(project.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Progress value={project.progress} className="h-2 mb-4" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{project.status}</span>
                  <div className="flex -space-x-2">
                    {project.team.map((member, index) => (
                      <div
                        key={index}
                        className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium border-2 border-background"
                      >
                        {member.split(" ").map(n => n[0]).join("")}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Project Tasks</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Task Description</Label>
                    <Input
                      value={newTaskContent}
                      onChange={(e) => setNewTaskContent(e.target.value)}
                      placeholder="Enter task description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Column</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      onChange={(e) => setSelectedColumn(e.target.value)}
                      value={selectedColumn || ''}
                    >
                      <option value="">Select column</option>
                      {Object.values(columns).map((column) => (
                        <option key={column.id} value={column.id}>
                          {column.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleAddTask} className="w-full">
                    Add Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(columns).map((column) => (
                <div key={column.id} className="space-y-4">
                  <div className="font-medium flex items-center justify-between">
                    <span>{column.title}</span>
                    <span className="text-muted-foreground text-sm">
                      {column.tasks.length}
                    </span>
                  </div>
                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-2 min-h-[200px]"
                      >
                        {column.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-3 cursor-move hover:shadow-md transition-shadow"
                              >
                                <p className="text-sm">{task.content}</p>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
