"use client"

import { useState, useEffect, useMemo } from "react" // Import useEffect
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Download,
} from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"



const transactionTypes = ["income", "expense"]

export default function FinancialManagement() {
  const isMobile = useMediaQuery("(max-width: 640px)")
  const [transactions, setTransactions] = useState<any[]>([]) // Type and initialize as empty
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState<any>(null)
  const [newTransaction, setNewTransaction] = useState({
    date: "",
    description: "",
    amount: "",
    type: "",
  })
    const [loading, setLoading] = useState(false); //for loading
    const [error, setError] = useState<string | null>(null); //for error
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  }>({ key: "date", direction: "descending" })


    // Fetch transactions on component mount
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/transactions");
                if (response.ok) {
                    const data = await response.json();
                    setTransactions(data);
                } else {
                    console.error("Failed to fetch transactions:", response.status);
                }
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);


  // Calculate total income, expenses, and balance
    const totalIncome = useMemo(() => {
        return transactions.reduce(
            (sum, transaction) => (transaction.type === "income" ? sum + transaction.amount : sum),
            0,
        );
    }, [transactions]);

    const totalExpenses = useMemo(() => {
        return transactions.reduce(
            (sum, transaction) => (transaction.type === "expense" ? sum + Math.abs(transaction.amount) : sum),
            0,
        );
    }, [transactions]);

  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  // Filter transactions based on search term
    const filteredTransactions = useMemo(() => {
        return transactions.filter(
            (transaction) =>
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.date.includes(searchTerm) ||
            transaction.amount.toString().includes(searchTerm),
        );
    }, [transactions, searchTerm]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
        return [...filteredTransactions].sort((a, b) => {
            if (!sortConfig) return 0;
            const keyA = a[sortConfig.key] ?? "";
            const keyB = b[sortConfig.key] ?? "";

            if (keyA < keyB) {
                return sortConfig.direction === "ascending" ? -1 : 1;
            }
            if (keyA > keyB) {
                return sortConfig.direction === "ascending" ? 1 : -1;
            }
            return 0;
        });
    }, [filteredTransactions, sortConfig]);


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

  // Handle adding a new transaction
    const handleAddTransaction = async () => {
        if (!isFormValid()) return;

        const amount =
        newTransaction.type === "expense" ? -Math.abs(Number(newTransaction.amount)) : Number(newTransaction.amount);

        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: newTransaction.date,
                    description: newTransaction.description,
                    amount, // Use the calculated amount
                    type: newTransaction.type,
                }),
            });
            if (response.ok) {
                const savedTransaction = await response.json();
                setTransactions([...transactions, savedTransaction]); // Add new transaction
                setNewTransaction({ date: "", description: "", amount: "", type: "" }); //reset
                setIsAddDialogOpen(false); //close dialog
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to add transaction");
                console.error("Failed to add transaction:", response.status);
            }

        } catch(error: any) {
            setError(error.message || "An unexpected error occurred");
            console.error("Error adding transaction:", error);
        } finally {
            setLoading(false)
        }
    };

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      newTransaction.date.trim() !== "" &&
      newTransaction.description.trim() !== "" &&
      newTransaction.amount.trim() !== "" &&
      newTransaction.type !== ""
    )
  }

 // Handle editing a transaction
    const handleEditTransaction = async () => {
        if (!currentTransaction) return;

        try {
            setLoading(true);
            setError(null)
            const response = await fetch(`/api/transactions/${currentTransaction._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...currentTransaction,
                    amount:
                    currentTransaction.type === "expense"
                        ? -Math.abs(currentTransaction.amount)
                        : Math.abs(currentTransaction.amount),
                }),
            });
            if(response.ok) {
                const updatedTransaction = await response.json();
                setTransactions(
                    transactions.map((transaction) =>
                        transaction._id === currentTransaction._id ? updatedTransaction : transaction
                    ),
                );
                setIsEditDialogOpen(false);

            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to edit transaction")
                console.error("Failed to edit transaction:", response.status);
            }
        } catch(error:any) {
            setError(error.message || "An unexpected error occurred")
            console.error("Error editing transaction:", error);
        } finally {
            setLoading(false)
        }
    };

  // Handle deleting a transaction
  const handleDeleteTransaction = async () => {
        if (!currentTransaction) return;

        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/transactions/${currentTransaction._id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setTransactions(transactions.filter((transaction) => transaction._id !== currentTransaction._id));
                setIsDeleteDialogOpen(false);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to delete transaction")
                console.error("Failed to delete transaction:", response.status);
            }
        } catch (error: any) {
            setError(error.message || "An unexpected error occured")
            console.error("Error deleting transaction:", error);
        } finally {
            setLoading(false)
        }
    };

  // Generate and download PDF report
  const handleDownloadPDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text("Financial Transactions Report", 14, 22)

    // Add date
    doc.setFontSize(11)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    // Add summary
    doc.setFontSize(14)
    doc.text("Summary", 14, 40)
    doc.setFontSize(11)
    doc.text(`Total Income: TZS ${totalIncome.toLocaleString()}`, 14, 48)
    doc.text(`Total Expenses: TZS ${totalExpenses.toLocaleString()}`, 14, 56)
    doc.text(`Current Balance: TZS ${balance.toLocaleString()}`, 14, 64)

    // Add transactions table
    autoTable(doc, {
      startY: 75,
      head: [["Date", "Description", "Amount (TZS)", "Type"]],
      body: sortedTransactions.map((t) => [
        t.date,
        t.description,
        t.amount.toLocaleString(),
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
      ]),
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [128, 0, 0] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    // Save the PDF
    doc.save(`financial_transactions_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  if (loading) {
    return <p>Loading transactions...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">TZS {totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">TZS {totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">TZS {balance.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="w-full sm:w-auto bg-blue-50 text-blue-600 hover:bg-blue-100"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-maroon-600 hover:bg-maroon-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>Enter the details of the new transaction.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount (TZS)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddTransaction} disabled={!isFormValid() || loading}>
                 {loading ? "Adding..." : "Add Transaction"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] cursor-pointer" onClick={() => requestSort("date")}>
                <div className="flex items-center">
                  Date
                  {getSortIcon("date")}
                </div>
              </TableHead>
              {!isMobile && (
                <TableHead className="cursor-pointer" onClick={() => requestSort("description")}>
                  <div className="flex items-center">
                    Description
                    {getSortIcon("description")}
                  </div>
                </TableHead>
              )}
              <TableHead className="cursor-pointer" onClick={() => requestSort("amount")}>
                <div className="flex items-center">
                  Amount (TZS)
                  {getSortIcon("amount")}
                </div>
              </TableHead>
              {!isMobile && (
                <TableHead className="cursor-pointer" onClick={() => requestSort("type")}>
                  <div className="flex items-center">
                    Type
                    {getSortIcon("type")}
                  </div>
                </TableHead>
              )}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{transaction.date}</TableCell>
                  {!isMobile && <TableCell>{transaction.description}</TableCell>}
                  <TableCell className={transaction.amount >= 0 ? "text-green-600" : "text-red-600"}>
                    {transaction.amount.toLocaleString()}
                  </TableCell>
                  {!isMobile && (
                    <TableCell>{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog
                        open={isEditDialogOpen && currentTransaction?._id === transaction._id}
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open)
                          if (!open) setCurrentTransaction(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => setCurrentTransaction(transaction)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full">
                          <DialogHeader>
                            <DialogTitle>Edit Transaction</DialogTitle>
                            <DialogDescription>Update the transaction's information.</DialogDescription>
                          </DialogHeader>
                          {currentTransaction && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-date" className="text-right">
                                  Date
                                </Label>
                                <Input
                                  id="edit-date"
                                  type="date"
                                  value={currentTransaction.date}
                                  onChange={(e) =>
                                    setCurrentTransaction({ ...currentTransaction, date: e.target.value })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-description" className="text-right">
                                  Description
                                </Label>
                                <Input
                                  id="edit-description"
                                  value={currentTransaction.description}
                                  onChange={(e) =>
                                    setCurrentTransaction({ ...currentTransaction, description: e.target.value })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-amount" className="text-right">
                                  Amount (TZS)
                                </Label>
                                <Input
                                  id="edit-amount"
                                  type="number"
                                  value={Math.abs(currentTransaction.amount)}
                                  onChange={(e) =>
                                    setCurrentTransaction({ ...currentTransaction, amount: Number(e.target.value) })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-type" className="text-right">
                                  Type
                                </Label>
                                <Select
                                  value={currentTransaction.type}
                                  onValueChange={(value) =>
                                    setCurrentTransaction({ ...currentTransaction, type: value })
                                  }
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {transactionTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="button" onClick={handleEditTransaction} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={isDeleteDialogOpen && currentTransaction?._id === transaction._id}
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open)
                          if (!open) setCurrentTransaction(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setCurrentTransaction(transaction)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full">
                          <DialogHeader>
                            <DialogTitle>Delete Transaction</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this transaction? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          {currentTransaction && (
                            <div className="py-4">
                              <p className="text-sm text-gray-500">
                                You are about to delete the transaction:{" "}
                                <span className="font-medium">{currentTransaction.description}</span> for{" "}
                                <span className="font-medium">TZS {currentTransaction.amount.toLocaleString()}</span>.
                              </p>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="button" variant="destructive" onClick={handleDeleteTransaction} disabled={loading}>
                            {loading ? "Deleting..." : "Delete"}
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
                <TableCell colSpan={isMobile ? 3 : 5} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  )
}