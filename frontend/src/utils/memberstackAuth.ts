/**
 * Memberstack authentication integration for CanAI Platform
 * Handles gated access to deliverables and user management
 */

import { generateCorrelationId } from './tracing';
import { insertSessionLog } from './supabase';

export interface MemberstackUser {
  id: string;
  email: string;
  auth: {
    uid: string;
    email: string;
  };
  planConnections: Array<{
    id: string;
    status: string;
    planId: string;
  }>;
}

export interface MemberstackAuthStatus {
  authenticated: boolean;
  user?: MemberstackUser;
  hasDeliverableAccess: boolean;
  error?: string;
}

// Memberstack configuration
const MEMBERSTACK_PUBLIC_KEY =
  import.meta.env.VITE_MEMBERSTACK_PUBLIC_KEY || 'pk_demo_key';

class MemberstackAuthClient {
  private initialized = false;
  private fallbackMode = true;

  constructor() {
    this.initializeMemberstack();
  }

  private async initializeMemberstack() {
    try {
      // TODO: Replace with actual Memberstack initialization
      if (
        typeof window !== 'undefined' &&
        MEMBERSTACK_PUBLIC_KEY !== 'pk_demo_key'
      ) {
        // Dynamic import for Memberstack (when actually implemented)
        // const memberstack = await import('@memberstack/dom');
        // await memberstack.init({ publicKey: MEMBERSTACK_PUBLIC_KEY });
        // this.fallbackMode = false;
        // this.initialized = true;
        console.log(
          '[Memberstack] Initialization skipped - using fallback mode'
        );
      }
    } catch (error) {
      console.warn(
        '[Memberstack] Initialization failed, using fallback mode:',
        error
      );
      this.fallbackMode = true;
    }
  }

  async getCurrentUser(): Promise<MemberstackUser | null> {
    if (this.fallbackMode) {
      // Fallback: Check localStorage for demo user
      const demoUser = localStorage.getItem('canai_demo_user');
      if (demoUser) {
        return JSON.parse(demoUser);
      }
      return null;
    }

    try {
      // TODO: Use actual Memberstack getCurrentMember
      // const { data: member } = await window.$memberstack.getCurrentMember();
      // return member;
      return null;
    } catch (error) {
      console.error('[Memberstack] Failed to get current user:', error);
      return null;
    }
  }

  async checkDeliverableAccess(productType: string): Promise<boolean> {
    const user = await this.getCurrentUser();

    if (!user) {
      console.log('[Memberstack] No authenticated user, access denied');
      return false;
    }

    if (this.fallbackMode) {
      // Fallback: Allow access for demo purposes
      console.log('[Memberstack] Demo mode - allowing deliverable access');
      return true;
    }

    try {
      // Check if user has active plan that includes deliverable access
      const hasActivePlan = user.planConnections?.some(
        plan =>
          plan.status === 'ACTIVE' &&
          ['business_builder', 'social_email', 'site_audit'].includes(
            productType.toLowerCase()
          )
      );

      console.log(
        `[Memberstack] Deliverable access check for ${productType}:`,
        hasActivePlan
      );
      return hasActivePlan || false;
    } catch (error) {
      console.error('[Memberstack] Access check failed:', error);
      return false;
    }
  }

  async getAuthStatus(): Promise<MemberstackAuthStatus> {
    try {
      const user = await this.getCurrentUser();
      const authenticated = !!user;
      const hasDeliverableAccess = authenticated
        ? await this.checkDeliverableAccess('business_builder')
        : false;

      return {
        authenticated,
        user: user || undefined,
        hasDeliverableAccess,
      };
    } catch (error) {
      console.error('[Memberstack] Auth status check failed:', error);
      return {
        authenticated: false,
        hasDeliverableAccess: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async loginUser(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.fallbackMode) {
        // Fallback: Create demo user
        const demoUser: MemberstackUser = {
          id: generateCorrelationId(),
          email,
          auth: { uid: generateCorrelationId(), email },
          planConnections: [
            {
              id: 'demo-plan',
              status: 'ACTIVE',
              planId: 'business_builder',
            },
          ],
        };

        localStorage.setItem('canai_demo_user', JSON.stringify(demoUser));

        // Log session
        await insertSessionLog({
          user_id: demoUser.id,
          interaction_type: 'user_login',
          interaction_details: {
            email,
            login_method: 'demo_fallback',
            correlation_id: generateCorrelationId(),
          },
        });

        console.log('[Memberstack] Demo login successful');
        return { success: true };
      }

      // TODO: Use actual Memberstack login
      // const result = await window.$memberstack.signIn({ email, password });
      // return { success: true };

      return { success: false, error: 'Memberstack not configured' };
    } catch (error) {
      console.error('[Memberstack] Login failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  async logoutUser(): Promise<void> {
    try {
      if (this.fallbackMode) {
        localStorage.removeItem('canai_demo_user');
        console.log('[Memberstack] Demo logout successful');
        return;
      }

      // TODO: Use actual Memberstack logout
      // await window.$memberstack.signOut();
    } catch (error) {
      console.error('[Memberstack] Logout failed:', error);
    }
  }
}

// Global Memberstack instance
export const memberstackAuth = new MemberstackAuthClient();

// Helper functions
export const requireDeliverableAccess = async (
  productType: string
): Promise<boolean> => {
  const hasAccess = await memberstackAuth.checkDeliverableAccess(productType);

  if (!hasAccess) {
    console.warn(`[Memberstack] Deliverable access denied for ${productType}`);

    // Log access attempt
    await insertSessionLog({
      user_id: undefined,
      interaction_type: 'access_denied',
      interaction_details: {
        product_type: productType,
        reason: 'insufficient_permissions',
        correlation_id: generateCorrelationId(),
      },
    });
  }

  return hasAccess;
};

export const trackUserAccess = async (
  action: string,
  details?: Record<string, any>
) => {
  const user = await memberstackAuth.getCurrentUser();

  await insertSessionLog({
    user_id: user?.id,
    interaction_type: 'user_access',
    interaction_details: {
      action,
      user_email: user?.email,
      ...details,
      correlation_id: generateCorrelationId(),
    },
  });
};

// TODO: Configure Memberstack
/*
1. Add Memberstack script to index.html:
   <script src="https://static.memberstack.com/scripts/v1/memberstack.js" data-memberstack-id="your-public-key"></script>

2. Initialize Memberstack in main.tsx or component:
   import MemberStack from '@memberstack/dom'
   await MemberStack.init({ publicKey: 'pk_your_key' })

3. Environment variables:
   VITE_MEMBERSTACK_PUBLIC_KEY=pk_your_key

4. Configure plans and permissions in Memberstack dashboard:
   - business_builder plan
   - social_email plan  
   - site_audit plan

5. Set up password reset flow and member portal
*/
