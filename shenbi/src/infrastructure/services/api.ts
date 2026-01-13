/**
 * API Client for Shenbi Backend
 * Uses @lemonade/sdk for all API calls.
 *
 * This module re-exports SDK types and provides thin wrappers around SDK methods.
 */

import { getLemonClient } from '../../features/shared/contexts/AuthContext';

// Re-export SDK types for use throughout the app
export { AssignmentStatus } from '@lemonade/sdk';

export type {
  // Progress types
  ProgressResponse,
  ProgressCreate,
  StatsResponse,
  // Profile types
  ProfileResponse,
  ProfileUpdate,
  // Settings types
  SettingsResponse,
  SettingsUpdate,
  // Achievement types
  AchievementResponse,
  AchievementCreate,
  // Classroom types
  ClassroomResponse,
  ClassroomCreate,
  ClassroomUpdate,
  JoinClassroomRequest,
  MemberResponse,
  // Assignment types
  AssignmentResponse,
  AssignmentCreate,
  AssignmentUpdate,
  SubmissionResponse,
  SubmissionGrade,
  GradebookEntry,
  // Session types (legacy)
  BattleSessionResponse,
  BattleSessionCreate,
  ClassroomSessionResponse,
  ClassroomSessionCreate,
  // Battle types (polling-based)
  BattleCreate,
  BattleJoin,
  BattleStart,
  BattleComplete,
  BattleResponse,
  BattleCompleteResponse,
  BattleLeaveResponse,
} from '@lemonade/sdk';

// Standard library function type (frontend-specific, not in SDK)
export interface StdlibFunctionParam {
  name: string;
  nameZh: string;
  type: 'number' | 'string' | 'boolean' | 'any';
}

export interface StdlibFunction {
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  params?: StdlibFunctionParam[];
  returns?: 'number' | 'string' | 'boolean' | 'void' | 'any';
  category: 'movement' | 'action' | 'sensor' | 'helper' | 'constant';
  code: string;
}

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Helper to wrap SDK calls with error handling
 */
async function wrapSdkCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error) {
      const e = error as { status: number; message?: string; body?: { detail?: string } };
      throw new ApiError(e.message || 'API request failed', e.status, e.body?.detail);
    }
    throw error;
  }
}

/**
 * Profile API
 */
export const profileApi = {
  get: () => wrapSdkCall(() => getLemonClient().shenbiProfile.get()),

  update: (data: Parameters<ReturnType<typeof getLemonClient>['shenbiProfile']['update']>[0]) =>
    wrapSdkCall(() => getLemonClient().shenbiProfile.update(data)),

  getStats: () => wrapSdkCall(() => getLemonClient().shenbiProfile.getStats()),
};

/**
 * Progress API
 */
export const progressApi = {
  getAll: () => wrapSdkCall(() => getLemonClient().shenbiProgress.getAll()),

  getByAdventure: (adventureSlug: string) =>
    wrapSdkCall(() => getLemonClient().shenbiProgress.getByAdventure(adventureSlug)),

  getByLevel: (adventureSlug: string, levelSlug: string) =>
    wrapSdkCall(() => getLemonClient().shenbiProgress.getByLevel(adventureSlug, levelSlug)),

  save: (data: Parameters<ReturnType<typeof getLemonClient>['shenbiProgress']['save']>[0]) =>
    wrapSdkCall(() => getLemonClient().shenbiProgress.save(data)),
};

/**
 * Settings API
 */
export const settingsApi = {
  get: () => wrapSdkCall(() => getLemonClient().shenbiSettings.get()),

  update: (data: Parameters<ReturnType<typeof getLemonClient>['shenbiSettings']['update']>[0]) =>
    wrapSdkCall(() => getLemonClient().shenbiSettings.update(data)),

  completeTour: (tourId: string) =>
    wrapSdkCall(() => getLemonClient().shenbiSettings.completeTour(tourId)),
};

/**
 * Achievements API
 */
export const achievementsApi = {
  list: () => wrapSdkCall(() => getLemonClient().shenbiAchievements.list()),

  award: (data: Parameters<ReturnType<typeof getLemonClient>['shenbiAchievements']['award']>[0]) =>
    wrapSdkCall(() => getLemonClient().shenbiAchievements.award(data)),

  check: (achievementId: string) =>
    wrapSdkCall(() => getLemonClient().shenbiAchievements.check(achievementId)),
};

/**
 * Sessions API
 */
export const sessionsApi = {
  getBattle: () => wrapSdkCall(() => getLemonClient().shenbiSessions.getBattle()),

  createBattle: (
    data: Parameters<ReturnType<typeof getLemonClient>['shenbiSessions']['createBattle']>[0]
  ) => wrapSdkCall(() => getLemonClient().shenbiSessions.createBattle(data)),

  endBattle: () => wrapSdkCall(() => getLemonClient().shenbiSessions.endBattle()),

  getClassroom: () => wrapSdkCall(() => getLemonClient().shenbiSessions.getClassroom()),

  createClassroom: (
    data: Parameters<ReturnType<typeof getLemonClient>['shenbiSessions']['createClassroom']>[0]
  ) => wrapSdkCall(() => getLemonClient().shenbiSessions.createClassroom(data)),

  endClassroom: () => wrapSdkCall(() => getLemonClient().shenbiSessions.endClassroom()),
};

/**
 * Classroom API
 */
export const classroomApi = {
  create: (data: Parameters<ReturnType<typeof getLemonClient>['shenbiClassrooms']['create']>[0]) =>
    wrapSdkCall(() => getLemonClient().shenbiClassrooms.create(data)),

  listOwned: () => wrapSdkCall(() => getLemonClient().shenbiClassrooms.listOwned()),

  listEnrolled: () => wrapSdkCall(() => getLemonClient().shenbiClassrooms.listEnrolled()),

  get: (classroomId: number) =>
    wrapSdkCall(() => getLemonClient().shenbiClassrooms.get(classroomId)),

  update: (
    classroomId: number,
    data: Parameters<ReturnType<typeof getLemonClient>['shenbiClassrooms']['update']>[1]
  ) => wrapSdkCall(() => getLemonClient().shenbiClassrooms.update(classroomId, data)),

  delete: (classroomId: number) =>
    wrapSdkCall(() => getLemonClient().shenbiClassrooms.delete(classroomId)),

  regenerateCode: (classroomId: number) =>
    wrapSdkCall(() => getLemonClient().shenbiClassrooms.regenerateCode(classroomId)),

  join: (data: Parameters<ReturnType<typeof getLemonClient>['shenbiClassrooms']['join']>[0]) =>
    wrapSdkCall(() => getLemonClient().shenbiClassrooms.join(data)),

  leave: (classroomId: number) =>
    wrapSdkCall(() => getLemonClient().shenbiClassrooms.leave(classroomId)),

  listMembers: (classroomId: number) =>
    wrapSdkCall(() => getLemonClient().shenbiClassrooms.listMembers(classroomId)),

  removeMember: (classroomId: number, studentId: number) =>
    wrapSdkCall(() => getLemonClient().shenbiClassrooms.removeMember(classroomId, studentId)),

  // Assignments
  createAssignment: (
    classroomId: number,
    data: Parameters<ReturnType<typeof getLemonClient>['shenbiClassrooms']['createAssignment']>[1]
  ) => wrapSdkCall(() => getLemonClient().shenbiClassrooms.createAssignment(classroomId, data)),

  listAssignments: (classroomId: number, includeAll = false) =>
    wrapSdkCall(() => getLemonClient().shenbiClassrooms.listAssignments(classroomId, includeAll)),

  getAssignment: (classroomId: number, assignmentId: number) =>
    wrapSdkCall(() => getLemonClient().shenbiClassrooms.getAssignment(classroomId, assignmentId)),

  updateAssignment: (
    classroomId: number,
    assignmentId: number,
    data: Parameters<ReturnType<typeof getLemonClient>['shenbiClassrooms']['updateAssignment']>[2]
  ) =>
    wrapSdkCall(() =>
      getLemonClient().shenbiClassrooms.updateAssignment(classroomId, assignmentId, data)
    ),

  deleteAssignment: (classroomId: number, assignmentId: number) =>
    wrapSdkCall(() =>
      getLemonClient().shenbiClassrooms.deleteAssignment(classroomId, assignmentId)
    ),

  publishAssignment: (classroomId: number, assignmentId: number) =>
    wrapSdkCall(() =>
      getLemonClient().shenbiClassrooms.publishAssignment(classroomId, assignmentId)
    ),

  // Submissions & Grading
  listSubmissions: (classroomId: number, assignmentId: number) =>
    wrapSdkCall(() => getLemonClient().shenbiClassrooms.listSubmissions(classroomId, assignmentId)),

  gradeSubmission: (
    classroomId: number,
    assignmentId: number,
    submissionId: number,
    data: Parameters<ReturnType<typeof getLemonClient>['shenbiClassrooms']['gradeSubmission']>[3]
  ) =>
    wrapSdkCall(() =>
      getLemonClient().shenbiClassrooms.gradeSubmission(
        classroomId,
        assignmentId,
        submissionId,
        data
      )
    ),

  getGradebook: (classroomId: number) =>
    wrapSdkCall(() => getLemonClient().shenbiClassrooms.getGradebook(classroomId)),
};

/**
 * Battle API (polling-based 1v1 battles)
 */
export const battleApi = {
  /** Create a new battle room. The caller becomes the host. */
  create: (data: Parameters<ReturnType<typeof getLemonClient>['shenbiBattles']['create']>[0]) =>
    wrapSdkCall(() => getLemonClient().shenbiBattles.create(data)),

  /** Join an existing battle room as guest. */
  join: (data: Parameters<ReturnType<typeof getLemonClient>['shenbiBattles']['join']>[0]) =>
    wrapSdkCall(() => getLemonClient().shenbiBattles.join(data)),

  /** Get current battle state. Poll every 500-1000ms. */
  get: (roomCode: string) => wrapSdkCall(() => getLemonClient().shenbiBattles.get(roomCode)),

  /** Start the battle (host only). Sets the level and begins the game. */
  start: (
    roomCode: string,
    data: Parameters<ReturnType<typeof getLemonClient>['shenbiBattles']['start']>[1]
  ) => wrapSdkCall(() => getLemonClient().shenbiBattles.start(roomCode, data)),

  /** Mark player as completed. First to complete wins. */
  complete: (
    roomCode: string,
    data: Parameters<ReturnType<typeof getLemonClient>['shenbiBattles']['complete']>[1]
  ) => wrapSdkCall(() => getLemonClient().shenbiBattles.complete(roomCode, data)),

  /** Leave the battle room. */
  leave: (roomCode: string) => wrapSdkCall(() => getLemonClient().shenbiBattles.leave(roomCode)),
};

/**
 * Stripe/Subscription API
 */
export const stripeApi = {
  listPlans: () => wrapSdkCall(() => getLemonClient().subscriptions.listPlans()),

  getCurrentSubscription: () => wrapSdkCall(() => getLemonClient().subscriptions.getCurrent()),

  /**
   * Create checkout session for a specific plan
   * @param planId - Optional plan ID. If not provided, uses the first monthly premium plan.
   * @param billingInterval - Optional billing interval filter ('monthly' | 'yearly')
   */
  createCheckoutSession: async (
    planId?: number,
    billingInterval?: 'monthly' | 'yearly'
  ): Promise<{ checkout_url: string }> => {
    let selectedPlanId = planId;

    if (!selectedPlanId) {
      // Get plans and find the matching one
      const plans = await wrapSdkCall(() => getLemonClient().subscriptions.listPlans());
      const premiumPlans = plans.filter((p) => !p.is_default && p.is_active);

      let selectedPlan;
      if (billingInterval) {
        selectedPlan = premiumPlans.find((p) => p.billing_interval === billingInterval);
      }
      if (!selectedPlan) {
        // Default to monthly if no interval specified or not found
        selectedPlan =
          premiumPlans.find((p) => p.billing_interval === 'monthly') || premiumPlans[0];
      }

      if (!selectedPlan) {
        throw new ApiError('No premium plan available', 404);
      }
      selectedPlanId = selectedPlan.id;
    }

    const currentUrl = window.location.origin;
    const result = await wrapSdkCall(() =>
      getLemonClient().subscriptions.createCheckout(
        selectedPlanId,
        `${currentUrl}/upgrade/success`,
        `${currentUrl}/upgrade/cancel`
      )
    );

    return { checkout_url: result.checkout_url };
  },

  createPortalSession: async (): Promise<{ portal_url: string }> => {
    const currentUrl = window.location.origin;
    const result = await wrapSdkCall(() =>
      getLemonClient().subscriptions.createPortal(`${currentUrl}/profile`)
    );
    return { portal_url: result.portal_url };
  },
};
