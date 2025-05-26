"use client";

import { useState } from "react";
import {
  type ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowUpDown, Filter, ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// Define the User interface
interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: string;
  dateAdded?: {
    seconds: number;
  };
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users: propsUsers }: UsersTableProps) {
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<string>("Sort");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [users, setUsers] = useState<User[]>(propsUsers);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const deleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/delete/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setUsers(users.filter((user) => user.id !== userId));
      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error("Failed to delete user");
      console.error("Error deleting user:", error);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            handleSort("name", column.getIsSorted() === "asc", "Name (A - Z)")
          }
          className="px-0"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={row.original.avatarUrl || "/placeholder.svg"} />
            <AvatarFallback>
              {row.original.firstName?.[0]}
              {row.original.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium">
              {row.original.firstName} {row.original.lastName}
            </span>
            <div className="text-sm text-muted-foreground">
              {row.original.email}
            </div>
          </div>
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const nameA =
          `${rowA.original.firstName} ${rowA.original.lastName}`.toLowerCase();
        const nameB =
          `${rowB.original.firstName} ${rowB.original.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      },
      filterFn: (row, columnId, filterValue) => {
        const name =
          `${row.original.firstName} ${row.original.lastName}`.toLowerCase();
        return name.includes(filterValue.toLowerCase());
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            handleSort("role", column.getIsSorted() === "asc", "Role")
          }
          className="px-0"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "dateAdded",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            handleSort(
              "dateAdded",
              column.getIsSorted() === "asc",
              "Date (New - Old)"
            )
          }
          className="px-0"
        >
          Date Added
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        row.original.dateAdded
          ? new Date(row.original.dateAdded.seconds * 1000).toLocaleDateString()
          : "—",
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.dateAdded?.seconds || 0;
        const dateB = rowB.original.dateAdded?.seconds || 0;
        return dateA - dateB;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteClick(row.original)}
          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  function handleSort(columnId: string, desc: boolean, label: string) {
    setSorting([{ id: columnId, desc }]);
    setCurrentSort(label);
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4 flex-1">
          <Input
            placeholder="Search users..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-md w-full text-lg"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                {roleFilter || "Role"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setRoleFilter("Student");
                  table.getColumn("role")?.setFilterValue("Student");
                }}
              >
                Student
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setRoleFilter("Faculty");
                  table.getColumn("role")?.setFilterValue("Faculty");
                }}
              >
                Faculty
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setRoleFilter(null);
                  table.getColumn("role")?.setFilterValue("");
                }}
              >
                Clear
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Link href="users/add-user">
            <Button className="bg-[#2F5233] hover:bg-[#2F5233]/90">
              <Plus className="h-4 w-4 mr-2" /> Add User
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/75 hover:bg-muted/75"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={"hover:bg-transparent"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center hover:bg-transparent"
                >
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete
                ? `You are about to delete ${userToDelete.firstName} ${userToDelete.lastName}. This action cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete?.id && deleteUser(userToDelete.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
