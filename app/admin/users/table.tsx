"use client";

import { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  MoreHorizontal,
  Plus,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const data: User[] = [
  {
    id: "1",
    name: "Jane Doe",
    email: "janed@up.edu.ph",
    role: "Faculty",
    dateAdded: "Dec 20, 2023",
    avatarUrl: "/placeholder.svg",
  },
  {
    id: "2",
    name: "John Smith",
    email: "johns@up.edu.ph",
    role: "Student",
    dateAdded: "Jan 15, 2024",
    avatarUrl: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Alice Johnson",
    email: "alicej@up.edu.ph",
    role: "Faculty",
    dateAdded: "Nov 5, 2023",
    avatarUrl: "/placeholder.svg",
  },
  {
    id: "4",
    name: "Bob Williams",
    email: "bobw@up.edu.ph",
    role: "Student",
    dateAdded: "Feb 10, 2024",
    avatarUrl: "/placeholder.svg",
  },
];

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        className="translate-y-[2px]"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(value) =>
          table.toggleAllPageRowsSelected(!!value.target.checked)
        }
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="translate-y-[2px]"
        checked={row.getIsSelected()}
        onChange={(value) => row.toggleSelected(!!value.target.checked)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={row.original.avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {row.original.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-sm text-muted-foreground">
              {row.original.email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "dateAdded",
    header: "Date Added",
    cell: ({ row }) => row.original.dateAdded,
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.dateAdded);
      const dateB = new Date(rowB.original.dateAdded);
      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit user</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UsersTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<string>("Sort");

  const handleSort = (id: string, desc: boolean, label: string) => {
    setSorting([{ id, desc }]);
    setCurrentSort(label);
  };

  const clearSort = () => {
    setSorting([]);
    setCurrentSort("Sort");
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {currentSort}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleSort("name", false, "Name (A - Z)")}
              >
                Name (A - Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSort("name", true, "Name (Z - A)")}
              >
                Name (Z - A)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleSort("dateAdded", true, "Date (New - Old)")
                }
              >
                Date (New - Old)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleSort("dateAdded", false, "Date (Old - New)")
                }
              >
                Date (Old - New)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearSort}>Clear</DropdownMenuItem>
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
    </div>
  );
}
