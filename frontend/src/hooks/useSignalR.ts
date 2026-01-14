import { useEffect, useRef } from 'react';
import { useSignalR as useSignalRContext } from '../contexts/SignalRContext';
import type { Event, Decision, UserState, Rule } from '../types';

interface UseRealtimeUpdatesOptions {
  onEventCreated?: (event: Event) => void;
  onDecisionMade?: (decision: Decision) => void;
  onUserStateChanged?: (state: UserState) => void;
  onRuleChanged?: (rule: Rule & { changeType: string }) => void;
  onDashboardUpdate?: () => void;
}

export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions) {
  const {
    onEventCreated: subscribeEventCreated,
    onDecisionMade: subscribeDecisionMade,
    onUserStateChanged: subscribeUserStateChanged,
    onRuleChanged: subscribeRuleChanged,
    onDashboardUpdate: subscribeDashboardUpdate,
    isConnected,
  } = useSignalRContext();

  // Use refs to keep callbacks stable
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribers: (() => void)[] = [];

    if (optionsRef.current.onEventCreated) {
      unsubscribers.push(
        subscribeEventCreated((event) => optionsRef.current.onEventCreated?.(event))
      );
    }

    if (optionsRef.current.onDecisionMade) {
      unsubscribers.push(
        subscribeDecisionMade((decision) => optionsRef.current.onDecisionMade?.(decision))
      );
    }

    if (optionsRef.current.onUserStateChanged) {
      unsubscribers.push(
        subscribeUserStateChanged((state) => optionsRef.current.onUserStateChanged?.(state))
      );
    }

    if (optionsRef.current.onRuleChanged) {
      unsubscribers.push(
        subscribeRuleChanged((rule) => optionsRef.current.onRuleChanged?.(rule))
      );
    }

    if (optionsRef.current.onDashboardUpdate) {
      unsubscribers.push(
        subscribeDashboardUpdate(() => optionsRef.current.onDashboardUpdate?.())
      );
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [
    isConnected,
    subscribeEventCreated,
    subscribeDecisionMade,
    subscribeUserStateChanged,
    subscribeRuleChanged,
    subscribeDashboardUpdate,
  ]);

  return { isConnected };
}

// Hook for user-specific updates (for User Portal)
export function useUserRealtimeUpdates(
  userId: string | undefined,
  options: {
    onStateChanged?: (state: UserState) => void;
    onDecisionMade?: (decision: Decision) => void;
    onEventCreated?: (event: Event) => void;
  }
) {
  const { onUserStateChanged, onDecisionMade, onEventCreated, isConnected } = useSignalRContext();

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!isConnected || !userId) return;

    const unsubscribers: (() => void)[] = [];

    if (optionsRef.current.onStateChanged) {
      unsubscribers.push(
        onUserStateChanged((state) => {
          if (state.userId === userId) {
            optionsRef.current.onStateChanged?.(state);
          }
        })
      );
    }

    if (optionsRef.current.onDecisionMade) {
      unsubscribers.push(
        onDecisionMade((decision) => {
          if (decision.userId === userId) {
            optionsRef.current.onDecisionMade?.(decision);
          }
        })
      );
    }

    if (optionsRef.current.onEventCreated) {
      unsubscribers.push(
        onEventCreated((event) => {
          if (event.userId === userId) {
            optionsRef.current.onEventCreated?.(event);
          }
        })
      );
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [isConnected, userId, onUserStateChanged, onDecisionMade, onEventCreated]);

  return { isConnected };
}
