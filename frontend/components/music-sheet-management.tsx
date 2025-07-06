"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"  // Import useEffect
import { PlusCircle, Search, FileText, Download, Trash2, ChevronDown, ChevronUp, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export default function MusicSheetManagement() {
    const { toast } = useToast();
    const [musicSheets, setMusicSheets] = useState<any[]>([]); // Type the array
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentSheet, setCurrentSheet] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newSheet, setNewSheet] = useState({
        name: "",
        composer: "",
        file: null as File | null,
    });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" }>({
        key: "name",
        direction: "ascending",
    });

    // Fetch music sheets on component mount
    useEffect(() => {
        const fetchMusicSheets = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/api/music-sheets");
                if (response.ok) {
                    const data = await response.json();
                    setMusicSheets(data);
                } else {
                    console.error("Failed to fetch music sheets:", response.status);
                }
            } catch (error) {
                console.error("Error fetching music sheets:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMusicSheets();
    }, []);

    const filteredSheets = useMemo(() => {
        return musicSheets.filter(
            (sheet) =>
                sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sheet.composer.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [musicSheets, searchTerm]);

    const sortedSheets = useMemo(() => {

        return [...filteredSheets].sort((a, b) => {
            if (!sortConfig) return 0;

            const keyA = a[sortConfig.key] ?? ""; // Handle null/undefined
            const keyB = b[sortConfig.key] ?? "";
            if (keyA < keyB) {
                return sortConfig.direction === "ascending" ? -1 : 1;
            }
            if (keyA > keyB) {
                return sortConfig.direction === "ascending" ? 1 : -1;
            }
            return 0;
        });
    }, [filteredSheets, sortConfig]);



    const requestSort = (key: string) => {
        let direction: "ascending" | "descending" = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (name: string) => {
      if (!sortConfig || sortConfig.key !== name) {
        return <ChevronDown className="ml-1 h-4 w-4 opacity-50" />;
      }
      return sortConfig.direction === "ascending" ? (
        <ChevronUp className="ml-1 h-4 w-4" />
      ) : (
        <ChevronDown className="ml-1 h-4 w-4" />
      );
    };

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Validate file type
            if (file.type !== 'application/pdf') {
                setUploadError('Please select a PDF file only.');
                return;
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setUploadError('File size must be less than 10MB.');
                return;
            }
            
            setUploadError(null);
            setNewSheet({ ...newSheet, file });
        }
    };

    const resetForm = () => {
        setNewSheet({ name: "", composer: "", file: null });
        setUploadError(null);
        // Reset file input
        const fileInput = document.getElementById('file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleAddSheet = async () => {
        if (!newSheet.file || !newSheet.name.trim() || !newSheet.composer.trim()) {
            setUploadError('Please fill in all fields and select a file.');
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append("name", newSheet.name.trim());
        formData.append("composer", newSheet.composer.trim());
        formData.append("file", newSheet.file); // Append the file

        try {
            const response = await fetch('/api/music-sheets', {
                method: 'POST',
                body: formData, // Send FormData, *not* JSON
                // No Content-Type header!  Let the browser set it.
            });

            if (response.ok) {
                const savedSheet = await response.json();
                setMusicSheets([...musicSheets, savedSheet]);
                resetForm();
                setIsAddDialogOpen(false);
                toast({
                    title: "Success!",
                    description: "Music sheet uploaded successfully.",
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `Failed to upload music sheet (${response.status})`;
                setUploadError(errorMessage);
                toast({
                    title: "Upload Failed",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error adding music sheet:", error);
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
    };
    const handleDeleteSheet = async () => {
        if (!currentSheet) return;
        try {
            const response = await fetch(`/api/music-sheets/${currentSheet._id}`, {
                method: "DELETE",
            });

            if(response.ok){
                setMusicSheets(musicSheets.filter((sheet) => sheet._id !== currentSheet._id));
                setIsDeleteDialogOpen(false);
                toast({
                    title: "Deleted",
                    description: "Music sheet deleted successfully.",
                });
            } else {
                console.error("Failed to delete sheet", response.status);
                toast({
                    title: "Delete Failed",
                    description: "Failed to delete music sheet. Please try again.",
                    variant: "destructive",
                });
            }
        } catch(error) {
            console.error("Error deleting music sheet", error);
            toast({
                title: "Error",
                description: "An error occurred while deleting the music sheet.",
                variant: "destructive",
            });
        }
    }

    const handleDownload = async (fileUrl: string, fileName: string) => {
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
            // Ensure the filename has .pdf extension
            const downloadName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
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
    };

    const handleView = (fileUrl: string) => {
      console.log("Opening file URL:", fileUrl); // Debugging - check console
      window.open(fileUrl, '_blank'); // Open in new tab
    };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Music Sheet Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-maroon-600 hover:bg-maroon-700" disabled={isUploading}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Music Sheet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Music Sheet</DialogTitle>
              <DialogDescription>Upload a PDF file and enter the details of the music sheet.</DialogDescription>
            </DialogHeader>
            
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Song Name *
                </Label>
                <Input
                  id="name"
                  value={newSheet.name}
                  onChange={(e) => setNewSheet({ ...newSheet, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter song name"
                  disabled={isUploading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="composer" className="text-right">
                  Composer *
                </Label>
                <Input
                  id="composer"
                  value={newSheet.composer}
                  onChange={(e) => setNewSheet({ ...newSheet, composer: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter composer name"
                  disabled={isUploading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  PDF File *
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input 
                    id="file" 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange} 
                    disabled={isUploading}
                  />
                  {newSheet.file && (
                    <div className="flex items-center text-sm text-green-600">
                      <Upload className="h-4 w-4 mr-1" />
                      {newSheet.file.name} ({(newSheet.file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Maximum file size: 10MB. PDF files only.</p>
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
                onClick={handleAddSheet}
                disabled={!newSheet.name.trim() || !newSheet.composer.trim() || !newSheet.file || isUploading}
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
          placeholder="Search music sheets..."
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
                  Song Name
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("composer")}>
                <div className="flex items-center">
                  Composer
                  {getSortIcon("composer")}
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
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading music sheets...
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedSheets.length > 0 ? (
              sortedSheets.map((sheet) => (
                <TableRow key={sheet._id}>
                  <TableCell className="font-medium">{sheet.name}</TableCell>
                  <TableCell>{sheet.composer}</TableCell>
                  <TableCell>{new Date(sheet.uploadDate).toISOString().split('T')[0]}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="text-blue-500 hover:text-blue-600"
                        title="Download"
                        onClick={() => handleDownload(sheet.fileUrl, sheet.originalFileName)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleView(sheet.fileUrl)} className="text-gray-500 hover:text-gray-600" title="View">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Dialog
                        open={isDeleteDialogOpen && currentSheet?._id === sheet._id}
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open)
                          if (!open) setCurrentSheet(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setCurrentSheet(sheet)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Music Sheet</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this music sheet? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          {currentSheet && (
                            <div className="py-4">
                              <p className="text-sm text-gray-500">
                                You are about to delete <span className="font-medium">{currentSheet.name}</span> by{" "}
                                {currentSheet.composer}.
                              </p>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSheet}>
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
                  No music sheets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}