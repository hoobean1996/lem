/**
 * Member List Component
 *
 * Displays and manages classroom members.
 */

import { useState, useEffect, useCallback } from 'react';
import { Users, UserMinus, Loader2, Search, UserCheck, UserX, Clock } from 'lucide-react';
import { classroomApi, ApiError } from '../../../../infrastructure/services/api';
import type { ShenbiMemberResponse } from '@lemonade/sdk';

// Local type for membership status
type MembershipStatus = 'active' | 'inactive' | 'removed' | 'left';

interface MemberListProps {
  classroomId: number;
  onMemberCountChange?: (count: number) => void;
}

export default function MemberList({ classroomId, onMemberCountChange }: MemberListProps) {
  const [members, setMembers] = useState<ShenbiMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classroomApi.listMembers(classroomId);
      setMembers(response as ShenbiMemberResponse[]);
      // Count only active members
      const activeCount = response.filter((m) => m.status === 'active').length;
      return activeCount;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError('Failed to load members');
      }
      return 0;
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    loadMembers().then((count) => {
      onMemberCountChange?.(count);
    });
  }, [loadMembers]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemove = async (member: ShenbiMemberResponse) => {
    const name = member.display_name || 'this student';
    if (!confirm(`Remove ${name} from the classroom?`)) {
      return;
    }

    try {
      setRemovingId(member.student_id);
      await classroomApi.removeMember(classroomId, member.student_id);
      // Update local state
      setMembers((prev) =>
        prev.map((m) =>
          m.student_id === member.student_id ? { ...m, status: 'removed' as MembershipStatus } : m
        )
      );
      // Update count
      const newActiveCount = members.filter(
        (m) => m.status === 'active' && m.student_id !== member.student_id
      ).length;
      onMemberCountChange?.(newActiveCount);
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.detail || 'Failed to remove member');
      }
    } finally {
      setRemovingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'removed':
        return <UserX className="w-4 h-4 text-red-600" />;
      case 'left':
        return <UserMinus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'removed':
        return 'Removed';
      case 'left':
        return 'Left';
    }
  };

  // Filter members
  const filteredMembers = members.filter((member) => {
    // Filter by status
    if (!showInactive && member.status !== 'active') {
      return false;
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = (member.display_name || '').toLowerCase();
      return name.includes(query);
    }

    return true;
  });

  const activeCount = members.filter((m) => m.status === 'active').length;
  const inactiveCount = members.length - activeCount;

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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#4a7a2a]" />
            Class Members
          </h2>
          <p className="text-sm text-gray-600">
            {activeCount} active student{activeCount !== 1 ? 's' : ''}
            {inactiveCount > 0 && `, ${inactiveCount} inactive`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4a7a2a] focus:border-[#4a7a2a] outline-none"
            />
          </div>

          {/* Show inactive toggle */}
          {inactiveCount > 0 && (
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-[#4a7a2a] focus:ring-[#4a7a2a]"
              />
              Show inactive
            </label>
          )}
        </div>
      </div>

      {/* Member List */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">
            {members.length === 0
              ? 'No students have joined yet. Share the join code to invite students.'
              : 'No students match your search.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Student</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Joined</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {member.display_name || `Student ${member.student_id}`}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(member.status)}
                      <span
                        className={`text-sm ${
                          member.status === 'active'
                            ? 'text-green-700'
                            : member.status === 'removed'
                              ? 'text-red-700'
                              : 'text-gray-600'
                        }`}
                      >
                        {getStatusLabel(member.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {member.status === 'active' && (
                      <button
                        onClick={() => handleRemove(member)}
                        disabled={removingId === member.student_id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {removingId === member.student_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserMinus className="w-4 h-4" />
                        )}
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
