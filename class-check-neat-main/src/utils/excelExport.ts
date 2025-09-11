import { Student } from '@/hooks/useStudents';
import { AttendanceRecord } from '@/hooks/useAttendance';

export const exportToExcel = (
  students: Student[],
  attendanceRecords: AttendanceRecord[],
  selectedDate: Date
) => {
  // Create CSV content
  const headers = ['Roll Number', 'Name', 'Email', 'Phone', 'Status', 'Date'];
  
  const rows = students.map(student => {
    const attendance = attendanceRecords.find(r => r.student_id === student.id);
    return [
      student.roll_number,
      student.name,
      student.email || '',
      student.phone || '',
      attendance?.status || 'Not Marked',
      selectedDate.toLocaleDateString()
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `attendance_${selectedDate.toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportAllAttendance = async (startDate: Date, endDate: Date) => {
  // This would require fetching all attendance data for the date range
  // For now, we'll just export current data
  console.log('Exporting attendance from', startDate, 'to', endDate);
  // Implementation would go here for full date range export
};