"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { auth } from "@/app/firebase-config";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordDialog({ open, onOpenChange }: PasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }, [open]);

  const validateConfirmPassword = () => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
    } else if (error === "New passwords do not match") {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;

      if (user && user.email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );

        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onOpenChange(false);
      } else {
        throw new Error("User not authenticated");
      }
    } catch (error: any) {
      console.error("Password change error:", error);

      // Check for Firebase auth error codes
      if (error.code === "auth/invalid-credential") {
        setError("Current password is incorrect. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else if (error.code === "auth/requires-recent-login") {
        setError(
          "For security reasons, please log out and log back in before changing your password."
        );
      } else {
        setError(
          error.message || "Failed to change password. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-bold">Change Password</DialogTitle>
          <DialogDescription>
            Enter your current and new password
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (confirmPassword) {
                    validateConfirmPassword();
                  }
                }}
                autoComplete="new-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (newPassword) {
                    validateConfirmPassword();
                  }
                }}
                onBlur={validateConfirmPassword}
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
