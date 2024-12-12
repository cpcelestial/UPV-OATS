'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Camera } from 'lucide-react'
import type { StudentProfile } from './types/profile'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: StudentProfile
  onUpdateProfile: (profile: Partial<StudentProfile>) => void
}

export function ProfileDialog({ open, onOpenChange, profile, onUpdateProfile }: ProfileDialogProps) {
  const [editedProfile, setEditedProfile] = useState(profile)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSave = () => {
    onUpdateProfile(editedProfile)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Please provide all required information
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={profile.avatarUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={editedProfile.firstName}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={editedProfile.lastName}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentNumber">Student Number</Label>
              <Input id="studentNumber" value={profile.studentNumber} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input id="college" value={profile.college} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degreeProgram">Degree Program</Label>
              <Input id="degreeProgram" value={profile.degreeProgram} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number (Optional)</Label>
              <Input
                id="contactNumber"
                value={editedProfile.contactNumber}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, contactNumber: e.target.value }))}
                placeholder="09XXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={editedProfile.country}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, country: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Input
                id="timezone"
                value={editedProfile.timezone}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, timezone: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={editedProfile.description}
              onChange={(e) => setEditedProfile(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell us about yourself..."
              className="h-24"
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Change Password</h3>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#2F5233] hover:bg-[#2F5233]/90"
              onClick={handleSave}
            >
              Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

