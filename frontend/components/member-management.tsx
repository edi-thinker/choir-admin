"use client"

import { useState, useEffect, useMemo } from "react"
import { PlusCircle, Search, Edit, Trash2, ChevronDown, ChevronUp, UserPlus, GraduationCap } from "lucide-react"
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
import { getAllPrograms } from "./program-data"


export default function MemberManagement() {
  const [members, setMembers] = useState<any[]>([]) 
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentMember, setCurrentMember] = useState<any>(null)
  const [newMember, setNewMember] = useState({
    name: "",
    phone: "",
    email: "",
    program: "",
    voiceGroup: "",
    academicStartYear: new Date().getFullYear(),
    studyDurationYears: 3,
  })
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  }>({ key: "name", direction: "ascending" })
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [transferYear, setTransferYear] = useState("")
  const [programInput, setProgramInput] = useState("")
  const allPrograms = useMemo(() => getAllPrograms(), [])

const [showProgramSuggestions, setShowProgramSuggestions] = useState(false);

  // Helper function to calculate current academic year
  const getCurrentAcademicYear = (startYear: number): number => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Academic year starts in October (month 10)
    let academicStartYear: number;
    if (currentMonth >= 10) {
      academicStartYear = currentYear;
    } else {
      academicStartYear = currentYear - 1;
    }
    
    return academicStartYear - startYear + 1;
  };

  // Helper function to check if a member has completed their studies
  const hasCompletedStudies = (member: any): boolean => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Calculate the year when studies should end (July of final academic year)
    const finalAcademicYear = member.academicStartYear + member.studyDurationYears - 1;
    const graduationYear = finalAcademicYear + 1; // July is in the calendar year after academic year started
    
    // If we're past July of the graduation year, studies are completed
    if (currentYear > graduationYear) {
      return true;
    }
    
    // If we're in the graduation year and past July (month 7), studies are completed
    if (currentYear === graduationYear && currentMonth > 7) {
      return true;
    }
    
    return false;
  };

  // Helper function to get academic year display
  const getAcademicYearDisplay = (member: any): string => {
    if (hasCompletedStudies(member)) {
      return "Graduated";
    }
    
    const currentYear = getCurrentAcademicYear(member.academicStartYear);
    if (currentYear > member.studyDurationYears) {
      return "Completed";
    }
    
    return `Year ${currentYear}`;
  };

  const filteredPrograms = useMemo(() => {
    return programInput === ""
      ? allPrograms
      : allPrograms.filter((program) => program.toLowerCase().includes(programInput.toLowerCase()))
  }, [allPrograms, programInput])

  // Fetch members on component mount
  useEffect(() => {
    fetchMembers()
  }, []) // Empty dependency array ensures this runs only once on mount


  // Filter members based on search term
  const filteredMembers = useMemo(() => {
      return members.filter(
          (member) =>
              member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              member.voiceGroup.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  }, [members, searchTerm]);
  // Sort members
  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) => {
      if (!sortConfig) return 0

      const keyA = a[sortConfig.key] ?? ""; //handle null and undefined values
      const keyB = b[sortConfig.key] ?? "";


      if (keyA < keyB) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (keyA > keyB) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    });
}, [filteredMembers, sortConfig]);

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
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

  // Handle adding a new member
  const handleAddMember = async () => {
    if (!isFormValid()) return;

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${apiUrl}/api/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...newMember, program: programInput }),
        });

        if (response.ok) {
            const savedMember = await response.json();
            setMembers([...members, savedMember]); // Add the saved member from the response
            setNewMember({ 
              name: "", 
              phone: "", 
              email: "", 
              program: "", 
              voiceGroup: "",
              academicStartYear: new Date().getFullYear(),
              studyDurationYears: 3
            });
            setProgramInput("");
            setIsAddDialogOpen(false);
        } else {
            console.error("Failed to add member:", response.status);
        }
    } catch (error) {
        console.error("Error adding member:", error);
    }
};

  // Check if all required fields are filled
  const isFormValid = () => {
      return (
          newMember.name.trim() !== "" &&
          newMember.phone.trim() !== "" &&
          newMember.email.trim() !== "" &&
          programInput.trim() !== "" &&
          newMember.voiceGroup !== "" &&
          newMember.academicStartYear > 0 &&
          newMember.studyDurationYears > 0
      );
  };
  // Handle editing a member
  const handleEditMember = async () => {
    if (!currentMember) return;

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${apiUrl}/api/members/${currentMember._id}`, { 
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(currentMember),
        });

        if (response.ok) {
            const updatedMember = await response.json();
            setMembers(members.map((member) => (member._id === currentMember._id ? updatedMember : member)));
            setIsEditDialogOpen(false);
        } else {
            console.error("Failed to edit member:", response.status);
        }
    } catch (error) {
        console.error("Error editing member:", error);
    }
};

  // Handle deleting a member
  const handleDeleteMember = async () => {
    if (!currentMember) return;

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${apiUrl}/api/members/${currentMember._id}`, { 
            method: 'DELETE',
        });

        if (response.ok) {
            setMembers(members.filter((member) => member._id !== currentMember._id));
            setIsDeleteDialogOpen(false);
        } else {
            console.error("Failed to delete member:", response.status);
        }
    } catch (error) {
        console.error("Error deleting member:", error);
    }
};

  // handle program select
  const handleProgramSelect = (program: string) => {
    setProgramInput(program)
    setNewMember({ ...newMember, program })
    setShowProgramSuggestions(false)
  }

  // Handle transferring a member to alumni 

const handleTransferToAlumni = async () => {
  if (!currentMember || !transferYear) {
    alert("Please select a member and enter the year completed."); 
    return;
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/api/members/${currentMember._id}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ yearCompleted: transferYear }),
    });

    if (response.ok) {
      // Remove the member from the local members list
      setMembers(members.filter((member) => member._id !== currentMember._id));
      setIsTransferDialogOpen(false);
      setTransferYear("");
        alert("Member transferred successfully!"); 
    } else {
      const errorData = await response.json(); 
      console.error("Failed to transfer member:", response.status, errorData.message);
      alert(`Failed to transfer member: ${errorData.message}`);  
    }
  } catch (error) {
    console.error("Error transferring member:", error);
    alert("An unexpected error occurred. See console for details.");
  }
};

// Handle checking graduation and auto-transfer
const handleCheckGraduation = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/api/members/check-graduation`, {
      method: 'POST',
    });

    if (response.ok) {
      const result = await response.json();
      alert(result.message);
      
      // Refresh the members list
      fetchMembers();
    } else {
      console.error("Failed to check graduation:", response.status);
      alert("Failed to check graduation");
    }
  } catch (error) {
    console.error("Error checking graduation:", error);
    alert("An unexpected error occurred");
  }
};

// Extract fetchMembers function
const fetchMembers = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/api/members`) 
    if (response.ok) {
      const data = await response.json()
      setMembers(data)
    } else {
      console.error("Failed to fetch members:", response.status)
    }
  } catch (error) {
    console.error("Error fetching members:", error)
  }
};


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleCheckGraduation}
            variant="outline"
            className="bg-blue-50 text-blue-600 hover:bg-blue-100"
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Check Graduation
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-maroon-600 hover:bg-maroon-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>Enter the details of the new choir member.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="program" className="text-right">
                  Program
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="program"
                    value={programInput}
                    onChange={(e) => {
                      setProgramInput(e.target.value)
                      setShowProgramSuggestions(true)
                    }}
                    onFocus={() => setShowProgramSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowProgramSuggestions(false), 200)}
                    className="w-full"
                    placeholder="Select or type program"
                    required
                  />
                  {showProgramSuggestions && programInput && filteredPrograms.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredPrograms.map((program) => (
                        <li
                          key={program}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleProgramSelect(program)
                          }}
                        >
                          {program}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="voiceGroup" className="text-right">
                  Voice Group
                </Label>
                <Select
                  value={newMember.voiceGroup}
                  onValueChange={(value) => setNewMember({ ...newMember, voiceGroup: value })}
                  required
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
                <Label htmlFor="academicStartYear" className="text-right">
                  Start Year
                </Label>
                <Input
                  id="academicStartYear"
                  type="number"
                  value={newMember.academicStartYear}
                  onChange={(e) => setNewMember({ ...newMember, academicStartYear: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="col-span-3"
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="studyDurationYears" className="text-right">
                  Study Years
                </Label>
                <Select
                  value={newMember.studyDurationYears.toString()}
                  onValueChange={(value) => setNewMember({ ...newMember, studyDurationYears: parseInt(value) })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select study duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="4">4 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="6">6 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="sm:justify-end">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-maroon-600 hover:bg-maroon-700" onClick={handleAddMember} disabled={!isFormValid()}>
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] cursor-pointer" onClick={() => requestSort("name")}>
                <div className="flex items-center">
                  Name
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="hidden sm:table-cell cursor-pointer" onClick={() => requestSort("phone")}>
                <div className="flex items-center">
                  Phone
                  {getSortIcon("phone")}
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => requestSort("email")}>
                <div className="flex items-center">
                  Email
                  {getSortIcon("email")}
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell cursor-pointer" onClick={() => requestSort("program")}>
                <div className="flex items-center">
                  Program
                  {getSortIcon("program")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("voiceGroup")}>
                <div className="flex items-center">
                  Voice Group
                  {getSortIcon("voiceGroup")}
                </div>
              </TableHead>
              <TableHead className="hidden xl:table-cell text-center">
                Current Year
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedMembers.length > 0 ? (
              sortedMembers.map((member) => (
                <TableRow key={member._id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{member.phone}</TableCell>
                  <TableCell className="hidden md:table-cell">{member.email}</TableCell>
                  <TableCell className="hidden lg:table-cell">{member.program}</TableCell>
                  <TableCell>{member.voiceGroup}</TableCell>
                  <TableCell className="hidden xl:table-cell text-center">
                    {member.academicStartYear ? 
                      getAcademicYearDisplay(member) : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog
                        open={isEditDialogOpen && currentMember?._id === member._id}
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open)
                          if (!open) setCurrentMember(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => setCurrentMember(member)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Member</DialogTitle>
                            <DialogDescription>Update the member's information.</DialogDescription>
                          </DialogHeader>
                          {currentMember && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                  Name
                                </Label>
                                <Input
                                  id="edit-name"
                                  value={currentMember.name}
                                  onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-phone" className="text-right">
                                  Phone
                                </Label>
                                <Input
                                  id="edit-phone"
                                  value={currentMember.phone}
                                  onChange={(e) => setCurrentMember({ ...currentMember, phone: e.target.value })}
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
                                  value={currentMember.email}
                                  onChange={(e) => setCurrentMember({ ...currentMember, email: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-program" className="text-right">
                                  Program
                                </Label>
                                <Input
                                  id="edit-program"
                                  value={currentMember.program}
                                  onChange={(e) => setCurrentMember({ ...currentMember, program: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-voiceGroup" className="text-right">
                                  Voice Group
                                </Label>
                                <Select
                                  value={currentMember.voiceGroup}
                                  onValueChange={(value) => setCurrentMember({ ...currentMember, voiceGroup: value })}
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
                                <Label htmlFor="edit-academicStartYear" className="text-right">
                                  Start Year
                                </Label>
                                <Input
                                  id="edit-academicStartYear"
                                  type="number"
                                  value={currentMember.academicStartYear || new Date().getFullYear()}
                                  onChange={(e) => setCurrentMember({ ...currentMember, academicStartYear: parseInt(e.target.value) || new Date().getFullYear() })}
                                  className="col-span-3"
                                  min="2000"
                                  max={new Date().getFullYear() + 1}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-studyDurationYears" className="text-right">
                                  Study Years
                                </Label>
                                <Select
                                  value={(currentMember.studyDurationYears || 3).toString()}
                                  onValueChange={(value) => setCurrentMember({ ...currentMember, studyDurationYears: parseInt(value) })}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select study duration" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1 Year</SelectItem>
                                    <SelectItem value="2">2 Years</SelectItem>
                                    <SelectItem value="3">3 Years</SelectItem>
                                    <SelectItem value="4">4 Years</SelectItem>
                                    <SelectItem value="5">5 Years</SelectItem>
                                    <SelectItem value="6">6 Years</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button className="bg-maroon-600 hover:bg-maroon-700" onClick={handleEditMember}>
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={isDeleteDialogOpen && currentMember?._id === member._id}
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open)
                          if (!open) setCurrentMember(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setCurrentMember(member)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Member</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this member? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          {currentMember && (
                            <div className="py-4">
                              <p className="text-sm text-gray-500">
                                You are about to delete <span className="font-medium">{currentMember.name}</span>.
                              </p>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteMember}>
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Dialog
                        open={isTransferDialogOpen && currentMember?._id === member._id}
                        onOpenChange={(open) => {
                          setIsTransferDialogOpen(open)
                          if (!open) {
                            setCurrentMember(null)
                            setTransferYear("")
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-blue-500 hover:text-blue-600"
                            onClick={() => setCurrentMember(member)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Transfer to Alumni</DialogTitle>
                            <DialogDescription>Transfer this member to the alumni list.</DialogDescription>
                          </DialogHeader>
                          {currentMember && (
                            <div className="py-4">
                              <p className="text-sm text-gray-500 mb-4">
                                You are about to transfer <span className="font-medium">{currentMember.name}</span> to
                                the alumni list.
                              </p>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="yearCompleted" className="text-right">
                                  Year Completed
                                </Label>
                                <Input
                                  id="yearCompleted"
                                  value={transferYear}
                                  onChange={(e) => setTransferYear(e.target.value)}
                                  className="col-span-3"
                                  placeholder="Enter completion year"
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={handleTransferToAlumni}
                              disabled={!transferYear}
                            >
                              Transfer to Alumni
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
                <TableCell colSpan={7} className="h-24 text-center">
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}