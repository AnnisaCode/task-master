
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Mail, Phone, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  skills: string[];
  availability: number;
  activeProjects: number;
  tasksCompleted: number;
  image: string;
}

const initialTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Doe",
    role: "Senior Developer",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    skills: ["React", "Node.js", "TypeScript"],
    availability: 75,
    activeProjects: 3,
    tasksCompleted: 45,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
  },
  {
    id: "2",
    name: "Sarah Smith",
    role: "UI/UX Designer",
    email: "sarah.smith@example.com",
    phone: "+1 234 567 891",
    skills: ["Figma", "Adobe XD", "Sketch"],
    availability: 90,
    activeProjects: 2,
    tasksCompleted: 38,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  },
  {
    id: "3",
    name: "Mike Johnson",
    role: "Project Manager",
    email: "mike.j@example.com",
    phone: "+1 234 567 892",
    skills: ["Agile", "Scrum", "Team Leadership"],
    availability: 60,
    activeProjects: 4,
    tasksCompleted: 52,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
  }
];

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    JSON.parse(localStorage.getItem('teamMembers') || JSON.stringify(initialTeamMembers))
  );
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    skills: ''
  });
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  }, [teamMembers]);

  const handleAddMember = () => {
    if (!newMember.name || !newMember.role || !newMember.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      role: newMember.role,
      email: newMember.email,
      phone: newMember.phone,
      skills: newMember.skills.split(',').map(skill => skill.trim()),
      availability: 100,
      activeProjects: 0,
      tasksCompleted: 0,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMember.name}`
    };

    setTeamMembers(prev => [...prev, member]);
    setNewMember({ name: '', role: '', email: '', phone: '', skills: '' });
    toast.success('Team member added successfully');
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;

    setTeamMembers(prev => 
      prev.map(member => member.id === editingMember.id ? editingMember : member)
    );
    setEditingMember(null);
    setIsEditDialogOpen(false);
    toast.success('Team member updated successfully');
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
    toast.success('Team member removed successfully');
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground mt-2">Manage your team members and their roles</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={newMember.role}
                    onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                    placeholder="Enter role"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={newMember.skills}
                    onChange={(e) => setNewMember({...newMember, skills: e.target.value})}
                    placeholder="Enter skills"
                  />
                </div>
                <Button onClick={handleAddMember} className="w-full">
                  Add Member
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Team Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Members</h3>
            <p className="text-2xl font-bold mt-2">{teamMembers.length}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Average Availability</h3>
            <p className="text-2xl font-bold mt-2">
              {Math.round(teamMembers.reduce((acc, member) => acc + member.availability, 0) / teamMembers.length)}%
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Tasks Completed</h3>
            <p className="text-2xl font-bold mt-2">
              {teamMembers.reduce((acc, member) => acc + member.tasksCompleted, 0)}
            </p>
          </Card>
        </div>

        {/* Team Members */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => openEditDialog(member)}>
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info('Assign tasks feature coming soon')}>
                      Assign Tasks
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-destructive"
                    >
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2" />
                  {member.email}
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2" />
                  {member.phone}
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  {member.activeProjects} Active Projects
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Availability</span>
                  <span>{member.availability}%</span>
                </div>
                <Progress value={member.availability} className="h-2" />
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Edit Member Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
            </DialogHeader>
            {editingMember && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Input
                    id="edit-role"
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-availability">Availability (%)</Label>
                  <Input
                    id="edit-availability"
                    type="number"
                    min="0"
                    max="100"
                    value={editingMember.availability}
                    onChange={(e) => setEditingMember({...editingMember, availability: Number(e.target.value)})}
                  />
                </div>
                <Button onClick={handleUpdateMember} className="w-full">
                  Update Member
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Team;

