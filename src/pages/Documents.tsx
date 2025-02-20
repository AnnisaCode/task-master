
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  Image, 
  FileSpreadsheet, 
  Search, 
  Plus,
  MoreVertical,
  Download,
  Share2,
  Clock,
  Upload
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  owner: string;
  icon: any;
}

const initialDocuments = [
  {
    id: "1",
    name: "Project Proposal.pdf",
    type: "PDF",
    size: "2.5 MB",
    lastModified: "2024-03-15",
    owner: "John Doe",
    icon: FileText,
  },
  {
    id: "2",
    name: "Design Assets.zip",
    type: "ZIP",
    size: "15 MB",
    lastModified: "2024-03-14",
    owner: "Sarah Smith",
    icon: Image,
  },
  {
    id: "3",
    name: "Budget Report.xlsx",
    type: "Spreadsheet",
    size: "1.2 MB",
    lastModified: "2024-03-13",
    owner: "Mike Johnson",
    icon: FileSpreadsheet,
  },
];

const recentActivities = [
  { user: "John Doe", action: "uploaded", document: "Project Timeline.pdf", time: "2 hours ago" },
  { user: "Sarah Smith", action: "modified", document: "Design Assets.zip", time: "3 hours ago" },
  { user: "Mike Johnson", action: "shared", document: "Budget Report.xlsx", time: "5 hours ago" },
];

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [newDocumentName, setNewDocumentName] = useState("");
  const [draggedDocument, setDraggedDocument] = useState<Document | null>(null);

  const handleDragStart = (document: Document) => {
    setDraggedDocument(document);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetDocument: Document) => {
    if (!draggedDocument) return;

    const reorderedDocuments = [...documents];
    const draggedIndex = documents.findIndex(doc => doc.id === draggedDocument.id);
    const targetIndex = documents.findIndex(doc => doc.id === targetDocument.id);

    reorderedDocuments.splice(draggedIndex, 1);
    reorderedDocuments.splice(targetIndex, 0, draggedDocument);

    setDocuments(reorderedDocuments);
    setDraggedDocument(null);
    toast.success("Document reordered successfully");
  };

  const handleAddDocument = () => {
    if (!newDocumentName) {
      toast.error("Please enter a document name");
      return;
    }

    const newDocument: Document = {
      id: String(documents.length + 1),
      name: newDocumentName,
      type: "PDF",
      size: "0.0 MB",
      lastModified: new Date().toISOString().split('T')[0],
      owner: localStorage.getItem("userEmail") || "Unknown",
      icon: FileText,
    };

    setDocuments([...documents, newDocument]);
    setNewDocumentName("");
    toast.success("Document added successfully");
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    toast.success("Document deleted successfully");
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDocument: Document = {
        id: String(documents.length + 1),
        name: file.name,
        type: file.type.split("/")[1].toUpperCase(),
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        lastModified: new Date().toISOString().split('T')[0],
        owner: localStorage.getItem("userEmail") || "Unknown",
        icon: FileText,
      };

      setDocuments([...documents, newDocument]);
      toast.success("File uploaded successfully");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Documents</h1>
            <p className="text-muted-foreground mt-2">Manage and organize your project documents</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Document Name</label>
                  <Input
                    value={newDocumentName}
                    onChange={(e) => setNewDocumentName(e.target.value)}
                    placeholder="Enter document name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Upload File</label>
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleAddDocument}>Add Document</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        {/* Documents Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="p-4"
              draggable
              onDragStart={() => handleDragStart(doc)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(doc)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/5 rounded-lg">
                    <doc.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">{doc.size}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last modified: {doc.lastModified}</span>
                <span className="text-muted-foreground">by {doc.owner}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <Card>
            <div className="divide-y">
              {recentActivities.map((activity, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.action}{" "}
                        <span className="font-medium">{activity.document}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documents;
