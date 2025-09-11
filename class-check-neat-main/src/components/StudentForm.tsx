import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Student } from '@/hooks/useStudents';

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  student?: Student | null;
  isEditing?: boolean;
}

export const StudentForm = ({ open, onClose, onSubmit, student, isEditing }: StudentFormProps) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    roll_number: student?.roll_number || '',
    email: student?.email || '',
    phone: student?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({ name: '', roll_number: '', email: '', phone: '' });
      onClose();
    } catch (error) {
      // Error handled in the hook
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="roll_number">Roll Number *</Label>
            <Input
              id="roll_number"
              value={formData.roll_number}
              onChange={(e) => handleChange('roll_number', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update' : 'Add'} Student
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};