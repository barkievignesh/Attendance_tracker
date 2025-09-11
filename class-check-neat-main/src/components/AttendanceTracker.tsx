import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Users, UserCheck, Clock, UserX, Plus, Edit, Trash2, Download, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useStudents, Student } from "@/hooks/useStudents";
import { useAttendance } from "@/hooks/useAttendance";
import { StudentForm } from "@/components/StudentForm";
import { AuditLogs } from "@/components/AuditLogs";
import { exportToExcel } from "@/utils/excelExport";

const AttendanceTracker = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const { students, loading: studentsLoading, addStudent, updateStudent, deleteStudent } = useStudents();
  const { attendanceRecords, loading: attendanceLoading, markAttendance, getStudentAttendance } = useAttendance(selectedDate);

  const handleMarkAttendance = (studentId: string, status: "present" | "absent" | "late") => {
    markAttendance(studentId, status);
  };

  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    await addStudent(studentData);
  };

  const handleUpdateStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingStudent) {
      await updateStudent(editingStudent.id, studentData);
      setEditingStudent(null);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    await deleteStudent(studentId);
  };

  const handleExportExcel = () => {
    exportToExcel(students, attendanceRecords, selectedDate);
  };

  const getStatusBadge = (status: "present" | "absent" | "late" | null) => {
    if (!status) return <Badge variant="outline">Not Marked</Badge>;
    
    const variants = {
      present: "bg-green-100 text-green-800",
      late: "bg-yellow-100 text-yellow-800", 
      absent: "bg-red-100 text-red-800"
    };

    return <Badge className={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const stats = {
    total: students.length,
    present: attendanceRecords.filter(r => r.status === "present").length,
    late: attendanceRecords.filter(r => r.status === "late").length,
    absent: attendanceRecords.filter(r => r.status === "absent").length,
  };

  if (studentsLoading) {
    return <div className="container mx-auto p-6 max-w-6xl">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Tracker</h1>
            <p className="text-gray-600">Track and manage student attendance</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button onClick={() => setShowStudentForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
            
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            {/* Attendance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Student Attendance - {format(selectedDate, "PPP")}</CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceLoading ? (
                  <div>Loading attendance...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.roll_number}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email || '-'}</TableCell>
                          <TableCell>{getStatusBadge(getStudentAttendance(student.id))}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleMarkAttendance(student.id, "present")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAttendance(student.id, "late")}
                                className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                              >
                                Late
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleMarkAttendance(student.id, "absent")}
                              >
                                Absent
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            {/* Students Management */}
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.roll_number}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email || '-'}</TableCell>
                        <TableCell>{student.phone || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingStudent(student);
                                setShowStudentForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {student.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteStudent(student.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <AuditLogs />
          </TabsContent>
        </Tabs>

        <StudentForm
          open={showStudentForm}
          onClose={() => {
            setShowStudentForm(false);
            setEditingStudent(null);
          }}
          onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}
          student={editingStudent}
          isEditing={!!editingStudent}
        />
      </div>
    </div>
  );
};

export default AttendanceTracker;