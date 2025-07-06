"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react" // Import useEffect
import { PlusCircle, Search, FileText, Download, Trash2, ChevronDown, ChevronUp, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

const departments = ["Administration", "Music", "Events", "Finance", "Public Relations"]

export default function DocumentManagement() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newDocument, setNewDocument] = useState({
    name: "",
    department: "",
    file: null as File | null,
  });  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  }>({ key: "name", direction: "ascending" })
    // Fetch documents on component mount
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/api/documents");
                if (response.ok) {
                    const data = await response.json();
                    setDocuments(data);
                } else {
                    console.error("Failed to fetch documents:", response.status);
                }
            } catch (error) {
                console.error("Error fetching documents:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocuments();
    }, []);


  const filteredDocuments = useMemo(() => {
     return documents.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.department.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  }, [documents, searchTerm])


    const sortedDocuments = useMemo(() => {
       return [...filteredDocuments].sort((a, b) => {
        if (!sortConfig) return 0;

        const keyA = a[sortConfig.key] ?? ""; //handle null/undefined
        const keyB = b[sortConfig.key] ?? "";

        if (keyA < keyB) {
            return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (keyA > keyB) {
            return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
        });
    }, [filteredDocuments, sortConfig])

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (name: string) => {
    if (!sortConfig || sortConfig.key !== name) {
      return <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    )
  }
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB.');
        return;
      }
      
      setUploadError(null);
      setNewDocument({ ...newDocument, file });
    }
  }

  const resetForm = () => {
    setNewDocument({ name: "", department: "", file: null });
    setUploadError(null);
    // Reset file input
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  const handleAddDocument = async () => {
    if (!newDocument.file || !newDocument.name.trim() || !newDocument.department) {
      setUploadError('Please fill in all fields and select a file.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("name", newDocument.name.trim());
    formData.append("department", newDocument.department);
    formData.append("file", newDocument.file); // Append the file

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData, // Send FormData, *not* JSON
        // No Content-Type header!  Let the browser set it.
      });

      if (response.ok) {
        const savedDocument = await response.json();
        setDocuments([...documents, savedDocument]);
        resetForm();
        setIsAddDialogOpen(false);
        toast({
          title: "Success!",
          description: "Document uploaded successfully.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to upload document (${response.status})`;
        setUploadError(errorMessage);
        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding document:", error);
      const errorMessage = 'Network error. Please check your connection and try again.';
      setUploadError(errorMessage);
      toast({
        title: "Network Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };    const handleDeleteDocument = async () => {
        if (!currentDocument) return;
        try {
            const response = await fetch(`/api/documents/${currentDocument._id}`, {
                method: "DELETE",
            });

            if(response.ok){
                setDocuments(documents.filter((doc) => doc._id !== currentDocument._id));
                setIsDeleteDialogOpen(false);
                toast({
                    title: "Deleted",
                    description: "Document deleted successfully.",
                });
            } else {
                console.error("Failed to delete document", response.status);
                toast({
                    title: "Delete Failed",
                    description: "Failed to delete document. Please try again.",
                    variant: "destructive",
                });
            }
        } catch(error) {
            console.error("Error deleting document", error);
            toast({
                title: "Error",
                description: "An error occurred while deleting the document.",
                variant: "destructive",
            });
        }
    };    const handleDownload = async (fileUrl: string, fileName: string) => {
        try {
            // For Cloudinary URLs, we can download directly
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Ensure proper file extension if not present
            const downloadName = fileName.includes('.') ? fileName : `${fileName}.pdf`;
            link.setAttribute('download', downloadName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast({
                title: "Download Started",
                description: `Downloading ${downloadName}...`,
            });
        } catch (error) {
            console.error('Download failed:', error);
            toast({
                title: "Download Failed",
                description: "Failed to download file. Please try again.",
                variant: "destructive",
            });
        }
    };      const handleView = (fileUrl: string) => {
        console.log("Opening file URL:", fileUrl); // Debugging - check console
        window.open(fileUrl, '_blank'); // Open in new tab
      };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-maroon-600 hover:bg-maroon-700" disabled={isUploading}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>Upload a file and enter the details of the document.</DialogDescription>
            </DialogHeader>
            
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Document Name *
                </Label>
                <Input
                  id="name"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter document name"
                  disabled={isUploading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department *
                </Label>
                <Select
                  value={newDocument.department}
                  onValueChange={(value) => setNewDocument({ ...newDocument, department: value })}
                  disabled={isUploading}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  File *
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input 
                    id="file" 
                    type="file" 
                    onChange={handleFileChange} 
                    disabled={isUploading}
                  />
                  {newDocument.file && (
                    <div className="flex items-center text-sm text-green-600">
                      <Upload className="h-4 w-4 mr-1" />
                      {newDocument.file.name} ({(newDocument.file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Maximum file size: 10MB. All file types accepted.</p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                className="bg-maroon-600 hover:bg-maroon-700"
                onClick={handleAddDocument}
                disabled={!newDocument.name.trim() || !newDocument.department || !newDocument.file || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px] cursor-pointer" onClick={() => requestSort("name")}>
                <div className="flex items-center">
                  Document Name
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("department")}>
                <div className="flex items-center">
                  Department
                  {getSortIcon("department")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("uploadDate")}>
                <div className="flex items-center">
                  Upload Date
                  {getSortIcon("uploadDate")}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading documents...
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedDocuments.length > 0 ? (
              sortedDocuments.map((doc) => (
                <TableRow key={doc._id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.department}</TableCell>
                  <TableCell>{new Date(doc.uploadDate).toISOString().split('T')[0]}</TableCell>
                  {/* <TableCell>{new Date(doc.uploadDate).toLocaleDateString()}</TableCell> */}
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="text-blue-500 hover:text-blue-600"
                        title="Download"
                        onClick={() => handleDownload(doc.fileUrl, doc.originalFileName)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-gray-500 hover:text-gray-600"
                        title="View"
                        onClick={() => handleView(doc.fileUrl)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>                      <Dialog
                        open={isDeleteDialogOpen && currentDocument?._id === doc._id}
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open)
                          if (!open) setCurrentDocument(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setCurrentDocument(doc)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Document</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this document? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          {currentDocument && (
                            <div className="py-4">
                              <p className="text-sm text-gray-500">
                                You are about to delete <span className="font-medium">{currentDocument.name}</span> from{" "}
                                {currentDocument.department} department.
                              </p>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteDocument}>
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No documents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}