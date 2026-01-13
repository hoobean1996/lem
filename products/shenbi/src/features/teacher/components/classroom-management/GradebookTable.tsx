/**
 * Gradebook Table Component
 *
 * Shows a comprehensive gradebook with all students and assignments.
 */

import { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, Loader2, Users } from 'lucide-react';
import { classroomApi, ApiError, GradebookEntry } from '../../../../infrastructure/services/api';

// Transformed gradebook structure for display
interface GradebookData {
  students: Array<{
    student_id: number;
    student_name: string | null;
    assignments: Record<number, number | null>;
    average_grade: number | null;
  }>;
  assignments: Array<{
    id: number;
    title: string;
    level_count?: number;
  }>;
}

interface GradebookTableProps {
  classroomId: number;
}

export default function GradebookTable({ classroomId }: GradebookTableProps) {
  const [gradebook, setGradebook] = useState<GradebookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGradebook = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const entries = (await classroomApi.getGradebook(classroomId)) as GradebookEntry[];

      // Transform the API response (GradebookEntry[]) to our display format
      // Each entry has: student_id, display_name, assignments (array of {assignment_id, title, grade, level_count}), average_grade

      // Extract unique assignments from all entries
      const assignmentMap = new Map<number, { id: number; title: string; level_count?: number }>();
      const students: GradebookData['students'] = [];

      for (const entry of entries) {
        const studentAssignments: Record<number, number | null> = {};

        // Process each assignment for this student
        if (Array.isArray(entry.assignments)) {
          for (const assignment of entry.assignments) {
            const assignmentId = assignment.assignment_id;
            if (assignmentId && !assignmentMap.has(assignmentId)) {
              assignmentMap.set(assignmentId, {
                id: assignmentId,
                title: assignment.title || `Assignment ${assignmentId}`,
                level_count: assignment.level_count,
              });
            }
            if (assignmentId) {
              studentAssignments[assignmentId] = assignment.grade ?? null;
            }
          }
        }

        students.push({
          student_id: entry.student_id,
          student_name: entry.display_name,
          assignments: studentAssignments,
          average_grade: entry.average_grade,
        });
      }

      setGradebook({
        students,
        assignments: Array.from(assignmentMap.values()),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError('Failed to load gradebook');
      }
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    loadGradebook();
  }, [loadGradebook]);

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'text-gray-400';
    if (grade >= 90) return 'text-green-600 font-medium';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatGrade = (grade: number | null) => {
    if (grade === null) return '-';
    return `${grade.toFixed(0)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#4a7a2a]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
    );
  }

  if (!gradebook) {
    return null;
  }

  const hasData = gradebook.students.length > 0 && gradebook.assignments.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#4a7a2a]" />
            Gradebook
          </h2>
          <p className="text-sm text-gray-600">
            {gradebook.students.length} student{gradebook.students.length !== 1 ? 's' : ''},{' '}
            {gradebook.assignments.length} assignment{gradebook.assignments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* TODO: Export functionality not available in SDK */}
      </div>

      {/* Empty States */}
      {gradebook.students.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No students in this classroom yet.</p>
        </div>
      )}

      {gradebook.students.length > 0 && gradebook.assignments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">
            No published assignments yet. Create and publish assignments to see grades.
          </p>
        </div>
      )}

      {/* Gradebook Table */}
      {hasData && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 sticky left-0 bg-gray-50 min-w-[180px]">
                    Student
                  </th>
                  {gradebook.assignments.map((assignment) => (
                    <th
                      key={assignment.id}
                      className="text-center px-4 py-3 text-sm font-medium text-gray-600 min-w-[100px]"
                    >
                      <div className="truncate max-w-[120px]" title={assignment.title}>
                        {assignment.title}
                      </div>
                      <div className="text-xs text-gray-400 font-normal">
                        {assignment.level_count} levels
                      </div>
                    </th>
                  ))}
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-800 bg-gray-100 min-w-[80px]">
                    Average
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gradebook.students.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 sticky left-0 bg-white">
                      <div className="font-medium text-gray-800">
                        {student.student_name || `Student ${student.student_id}`}
                      </div>
                    </td>
                    {gradebook.assignments.map((assignment) => {
                      const grade = student.assignments[assignment.id];
                      return (
                        <td
                          key={assignment.id}
                          className={`px-4 py-3 text-center ${getGradeColor(grade)}`}
                        >
                          {formatGrade(grade)}
                        </td>
                      );
                    })}
                    <td
                      className={`px-4 py-3 text-center bg-gray-50 font-medium ${getGradeColor(
                        student.average_grade
                      )}`}
                    >
                      {formatGrade(student.average_grade)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      {hasData && (
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
            <span>90-100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
            <span>80-89%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" />
            <span>70-79%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-100 border border-orange-300" />
            <span>60-69%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
            <span>&lt;60%</span>
          </div>
        </div>
      )}
    </div>
  );
}
