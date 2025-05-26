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
import { Badge } from "@/components/ui/badge";
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
import { ArrowUpDown, Filter, ChevronDown } from "lucide-react";
import type { Faculty } from "@/app/data";

interface FacultyTableProps {
  faculty: Faculty[];
}

export function FacultyTable({ faculty: propsFaculty }: FacultyTableProps) {
  const [faculty, setFaculty] = useState<Faculty[]>(propsFaculty);
  const [collegeFilter, setCollegeFilter] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  function handleSort(columnId: string, desc: boolean) {
    setSorting([{ id: columnId, desc }]);
  }

  const columns: ColumnDef<Faculty>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => handleSort("name", column.getIsSorted() === "asc")}
          className="px-0"
        >
          Student
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
        const email = row.original.email.toLowerCase();
        const studentNumber = row.original.facultyNumber.toLowerCase();
        const searchValue = filterValue.toLowerCase();
        return (
          name.includes(searchValue) ||
          email.includes(searchValue) ||
          studentNumber.includes(searchValue)
        );
      },
    },
    {
      accessorKey: "facultyNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            handleSort("facultyNumber", column.getIsSorted() === "asc")
          }
          className="px-0"
        >
          Student Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.facultyNumber}</Badge>
      ),
    },
    {
      accessorKey: "college",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => handleSort("college", column.getIsSorted() === "asc")}
          className="px-0"
        >
          College
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "department",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            handleSort("department", column.getIsSorted() === "asc")
          }
          className="px-0"
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: faculty,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  // Get unique colleges for filter
  const colleges = Array.from(
    new Set(faculty.map((faculty) => faculty.college))
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-4 flex-1">
          <Input
            placeholder="Search students..."
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
                {collegeFilter || "College"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {colleges.map((college) => (
                <DropdownMenuItem
                  key={college}
                  onClick={() => {
                    setCollegeFilter(college);
                    table.getColumn("college")?.setFilterValue(college);
                  }}
                >
                  {college}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => {
                  setCollegeFilter(null);
                  table.getColumn("college")?.setFilterValue("");
                }}
              >
                Clear
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      <div className="flex items-center justify-end space-x-2 pt-4">
        <div className="text-muted-foreground flex-1 text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
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
