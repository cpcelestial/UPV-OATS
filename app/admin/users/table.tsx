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
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { ArrowUpDown, Filter, ChevronDown, Plus } from "lucide-react";

export function UsersTable({ users }) {
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<string>("Sort");
  const [sorting, setSorting] = useState([]);

  const columns: ColumnDef<any>[] = [
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

  function clearSort() {
    setSorting([]);
    setCurrentSort("Sort");
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
