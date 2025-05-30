"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { AvailabilityTable } from "./availability-table";

export default function SchedulePage() {
  const currentDate = new Date();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const [editMode, setEditMode] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleBack = () => {
    if (editMode) {
      setShowDialog(true);
    } else {
      window.history.back();
    }
  };

  const handleConfirmBack = () => {
    setShowDialog(false);
    window.history.back();
  };

  return (
    <div className="px-4 py-2">
      <Button
        className="float-right ml-4"
        variant="secondary"
        onClick={handleBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Button
        className="float-right"
        onClick={toggleEditMode}
        variant={editMode ? "default" : "outline"}
      >
        {editMode ? "Save Changes" : "Edit Schedule"}
      </Button>

      <Tabs defaultValue="weekly">
        <TabsList className="mb-4">
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="daily">Daily Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <AvailabilityTable startDate={startOfWeek} editMode={editMode} />
        </TabsContent>

        <TabsContent value="daily">
          <AvailabilityTable
            startDate={currentDate}
            editMode={editMode}
            dailyView
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>
              Changes will not be saved. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBack}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
