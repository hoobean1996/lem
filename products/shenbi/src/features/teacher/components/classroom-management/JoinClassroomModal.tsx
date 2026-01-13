/**
 * Join Classroom Modal
 *
 * Modal for students to join a classroom with a code.
 */

import { useState } from 'react';
import { X, GraduationCap, Loader2 } from 'lucide-react';
import { classroomApi, ClassroomResponse, ApiError } from '../../../../infrastructure/services/api';

interface JoinClassroomModalProps {
  onClose: () => void;
  onJoined: (classroom: ClassroomResponse) => void;
}

export default function JoinClassroomModal({ onClose, onJoined }: JoinClassroomModalProps) {
  const [joinCode, setJoinCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError('Join code must be 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await classroomApi.join({ code });

      // Get classroom details to return
      const classrooms = await classroomApi.listEnrolled();
      const classroom = classrooms.find((c) => c.join_code === code);

      if (classroom) {
        onJoined(classroom);
      } else {
        // Fallback - just close the modal
        onClose();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('Invalid join code. Please check and try again.');
        } else if (err.status === 400) {
          setError(err.detail || 'Unable to join this classroom');
        } else {
          setError(err.detail || 'Failed to join classroom');
        }
      } else {
        setError('Failed to join classroom');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow alphanumeric and uppercase
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setJoinCode(cleaned.slice(0, 6));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#4a7a2a]" />
            <h2 className="text-lg font-bold text-gray-800">Join a Class</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Join Code *</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="ABCD12"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7a2a] focus:border-[#4a7a2a] outline-none text-center font-mono text-2xl tracking-widest uppercase"
              maxLength={6}
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-1">Ask your teacher for the 6-character code</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name (optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you want to appear in class"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7a2a] focus:border-[#4a7a2a] outline-none"
              maxLength={100}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || joinCode.length !== 6}
              className="flex-1 py-2.5 bg-[#4a7a2a] text-white rounded-xl font-medium hover:bg-[#3a6a1a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Class'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
