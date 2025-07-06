"use client"

import { useState, useEffect, useMemo } from "react"
import { PlusCircle, Search, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react"
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

// NO MORE MOCK DATA

export default function AlumniManagement() {
  const [alumni, setAlumni] = useState<any[]>([]) // Type the array
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentAlumnus, setCurrentAlumnus] = useState<any>(null)
  const [newAlumnus, setNewAlumnus] = useState({
    name: "",
    phone: "",
    email: "",
    voiceGroup: "",
    yearCompleted: "",
  })
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  }>({ key: "name", direction: "ascending" })

    // Fetch alumni on component mount
    useEffect(() => {
        const fetchAlumni = async () => {
            try {
                const response = await fetch("/api/alumni"); // Use relative URL
                if (response.ok) {
                    const data = await response.json();
                    setAlumni(data);
                } else {
                    console.error("Failed to fetch alumni:", response.status);
                }
            } catch (error) {
                console.error("Error fetching alumni:", error);
            }
        };

        fetchAlumni();
    }, []);


  // Filter alumni based on search term
    const filteredAlumni = useMemo(() => {
        return alumni.filter(
            (alumnus) =>
                alumnus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alumnus.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alumnus.voiceGroup.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [alumni, searchTerm]);

  // Sort alumni
    const sortedAlumni = useMemo(() => {
        return [...filteredAlumni].sort((a, b) => {
            if (!sortConfig) return 0;

            const keyA = a[sortConfig.key] ?? ""; //handle null and undefined
            const keyB = b[sortConfig.key] ?? "";

            if (keyA < keyB) {
                return sortConfig.direction === "ascending" ? -1 : 1;
            }
            if (keyA > keyB) {
                return sortConfig.direction === "ascending" ? 1 : -1;
            }
            return 0;
        });
    }, [filteredAlumni, sortConfig]);

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (name: string) => {
    if (sortConfig.key !== name) {
      return <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    )
  }

  // Handle adding a new alumnus
    const handleAddAlumnus = async () => {
        try {
            const response = await fetch('/api/alumni', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAlumnus),
            });

            if (response.ok) {
                const savedAlumnus = await response.json();
                setAlumni([...alumni, savedAlumnus]);
                setNewAlumnus({ name: "", phone: "", email: "", voiceGroup: "", yearCompleted: "" });
                setIsAddDialogOpen(false);
            } else {
                console.error("Failed to add alumnus:", response.status);
            }
        } catch (error) {
            console.error("Error adding alumnus:", error);
        }
    };


  // Handle editing an alumnus
    const handleEditAlumnus = async () => {
        if (!currentAlumnus) return;

        try {
            const response = await fetch(`/api/alumni/${currentAlumnus._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentAlumnus),
            });

            if (response.ok) {
                const updatedAlumnus = await response.json();
                setAlumni(alumni.map((alumnus) => (alumnus._id === currentAlumnus._id ? updatedAlumnus : alumnus)));
                setIsEditDialogOpen(false);
            } else {
                console.error("Failed to edit alumnus:", response.status);
            }
        } catch (error) {
            console.error("Error editing alumnus:", error);
        }
    };

  // Handle deleting an alumnus
    const handleDeleteAlumnus = async () => {
        if (!currentAlumnus) return;

        try {
            const response = await fetch(`/api/alumni/${currentAlumnus._id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setAlumni(alumni.filter((alumnus) => alumnus._id !== currentAlumnus._id));
                setIsDeleteDialogOpen(false);
            } else {
                console.error("Failed to delete alumnus:", response.status);
            }
        } catch (error) {
            console.error("Error deleting alumnus:", error);
        }
    };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Alumni Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-maroon-600 hover:bg-maroon-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Alumnus
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Alumnus</DialogTitle>
              <DialogDescription>Enter the details of the new alumnus.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newAlumnus.name}
                  onChange={(e) => setNewAlumnus({ ...newAlumnus, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={newAlumnus.phone}
                  onChange={(e) => setNewAlumnus({ ...newAlumnus, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newAlumnus.email}
                  onChange={(e) => setNewAlumnus({ ...newAlumnus, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="voiceGroup" className="text-right">
                  Voice Group
                </Label>
                <Select
                  value={newAlumnus.voiceGroup}
                  onValueChange={(value) => setNewAlumnus({ ...newAlumnus, voiceGroup: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select voice group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Soprano">Soprano</SelectItem>
                    <SelectItem value="Alto">Alto</SelectItem>
                    <SelectItem value="Tenor">Tenor</SelectItem>
                    <SelectItem value="Bass">Bass</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="yearCompleted" className="text-right">
                  Year Completed
                </Label>
                <Input
                  id="yearCompleted"
                  value={newAlumnus.yearCompleted}
                  onChange={(e) => setNewAlumnus({ ...newAlumnus, yearCompleted: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-maroon-600 hover:bg-maroon-700" onClick={handleAddAlumnus}>
                Add Alumnus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search alumni..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] cursor-pointer" onClick={() => requestSort("name")}>
                <div className="flex items-center">
                  Name
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("phone")}>
                <div className="flex items-center">
                  Phone
                  {getSortIcon("phone")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("email")}>
                <div className="flex items-center">
                  Email
                  {getSortIcon("email")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("voiceGroup")}>
                <div className="flex items-center">
                  Voice Group
                  {getSortIcon("voiceGroup")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("yearCompleted")}>
                <div className="flex items-center">
                  Year Completed
                  {getSortIcon("yearCompleted")}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAlumni.length > 0 ? (
              sortedAlumni.map((alumnus) => (
                <TableRow key={alumnus._id}>
                  <TableCell className="font-medium">{alumnus.name}</TableCell>
                  <TableCell>{alumnus.phone}</TableCell>
                  <TableCell>{alumnus.email}</TableCell>
                  <TableCell>{alumnus.voiceGroup}</TableCell>
                  <TableCell>{alumnus.yearCompleted}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog
                        open={isEditDialogOpen && currentAlumnus?._id === alumnus._id}
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open)
                          if (!open) setCurrentAlumnus(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => setCurrentAlumnus(alumnus)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Alumnus</DialogTitle>
                            <DialogDescription>Update the alumnus's information.</DialogDescription>
                          </DialogHeader>
                          {currentAlumnus && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                  Name
                                </Label>
                                <Input
                                  id="edit-name"
                                  value={currentAlumnus.name}
                                  onChange={(e) => setCurrentAlumnus({ ...currentAlumnus, name: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-phone" className="text-right">
                                  Phone
                                </Label>
                                <Input
                                  id="edit-phone"
                                  value={currentAlumnus.phone}
                                  onChange={(e) => setCurrentAlumnus({ ...currentAlumnus, phone: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-email" className="text-right">
                                  Email
                                </Label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={currentAlumnus.email}
                                  onChange={(e) => setCurrentAlumnus({ ...currentAlumnus, email: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-voiceGroup" className="text-right">
                                  Voice Group
                                </Label>
                                <Select
                                  value={currentAlumnus.voiceGroup}
                                  onValueChange={(value) => setCurrentAlumnus({ ...currentAlumnus, voiceGroup: value })}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select voice group" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Soprano">Soprano</SelectItem>
                                    <SelectItem value="Alto">Alto</SelectItem>
                                    <SelectItem value="Tenor">Tenor</SelectItem>
                                    <SelectItem value="Bass">Bass</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-yearCompleted" className="text-right">
                                  Year Completed
                                </Label>
                                <Input
                                  id="edit-yearCompleted"
                                  value={currentAlumnus.yearCompleted}
                                  onChange={(e) =>
                                    setCurrentAlumnus({ ...currentAlumnus, yearCompleted: e.target.value })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button className="bg-maroon-600 hover:bg-maroon-700" onClick={handleEditAlumnus}>
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={isDeleteDialogOpen && currentAlumnus?._id === alumnus._id}
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open)
                          if (!open) setCurrentAlumnus(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setCurrentAlumnus(alumnus)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Alumnus</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this alumnus? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          {currentAlumnus && (
                            <div className="py-4">
                              <p className="text-sm text-gray-500">
                                You are about to delete <span className="font-medium">{currentAlumnus.name}</span>.
                              </p>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteAlumnus}>
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
                <TableCell colSpan={6} className="h-24 text-center">
                  No alumni found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}