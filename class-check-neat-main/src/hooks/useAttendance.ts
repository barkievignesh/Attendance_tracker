import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  marked_at: string;
  created_at: string;
}

export const useAttendance = (selectedDate: Date) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchAttendance = async () => {
    try {
      const dateStr = formatDate(selectedDate);
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('date', dateStr);

      if (error) throw error;
      setAttendanceRecords((data || []) as AttendanceRecord[]);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    try {
      const dateStr = formatDate(selectedDate);
      
      // Check if record exists
      const { data: existing } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('student_id', studentId)
        .eq('date', dateStr)
        .single();

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('attendance_records')
          .update({ status })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        setAttendanceRecords(prev => 
          prev.map(record => record.id === existing.id ? data as AttendanceRecord : record)
        );
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('attendance_records')
          .insert([{
            student_id: studentId,
            date: dateStr,
            status
          }])
          .select()
          .single();

        if (error) throw error;
        setAttendanceRecords(prev => [...prev, data as AttendanceRecord]);
      }

      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  const getStudentAttendance = (studentId: string) => {
    const record = attendanceRecords.find(r => r.student_id === studentId);
    return record?.status || null;
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  return {
    attendanceRecords,
    loading,
    markAttendance,
    getStudentAttendance,
    fetchAttendance,
  };
};