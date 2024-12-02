'use client'

import { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, MoreHorizontal, Plus, Filter } from 'lucide-react'
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "./types/user"

const data: User[] = [
  {
    id: "1",
    name: "Jane Doe",
    email: "janed@up.edu.ph",
    role: "Admin",
    lastActive: "2 hours ago",
    dateAdded: "Dec 20, 2023",
    avatarUrl: "/placeholder.svg"
  },
  // Add more sample data as needed
]

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        className="translate-y-[2px]"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(value) => table.toggleAllPageRowsSelected(!!value.target.checked)}
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
    header: "User name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={row.original.avatarUrl} />
            <AvatarFallback>{row.original.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-sm text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "lastActive",
    header: "Last Active",
  },
  {
    accessorKey: "dateAdded",
    header: "Date Added",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View user details</DropdownMenuItem>
            <DropdownMenuItem>Edit user</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function UsersTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

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
  })

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
            className="max-w-md w-full h-12 text-lg"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Role</DropdownMenuItem>
              <DropdownMenuItem>Last Active</DropdownMenuItem>
              <DropdownMenuItem>Date Added</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Link href="users/add-user">
            <Button 
              size="lg" 
              className="bg-[#35563F] hover:bg-[#2A4A33] text-white h-12 px-6"
            >
              <Plus className="mr-2 h-5 w-5" /> Add user
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export Users</DropdownMenuItem>
              <DropdownMenuItem>Import Users</DropdownMenuItem>
              <DropdownMenuItem>Delete Users</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
                  )
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
                  className="h-24 text-center"
                >
                  No results.
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
  )
}

