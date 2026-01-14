import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import type { Event, Decision, UserState, Rule } from '../types';

interface SignalRContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  connectionState: signalR.HubConnectionState;
  // Event callbacks
  onEventCreated: (callback: (event: Event) => void) => () => void;
  onDecisionMade: (callback: (decision: Decision) => void) => () => void;
  onUserStateChanged: (callback: (state: UserState) => void) => () => void;
  onRuleChanged: (callback: (rule: Rule & { changeType: string }) => void) => () => void;
  onDashboardUpdate: (callback: () => void) => () => void;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
const HUB_URL = API_BASE_URL.replace('/api', '/hubs/decision');

interface SignalRProviderProps {
  children: ReactNode;
}

export function SignalRProvider({ children }: SignalRProviderProps) {
  const { isAuthenticated } = useAuth();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected
  );

  const isConnected = connectionState === signalR.HubConnectionState.Connected;

  // Build connection when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      if (connection) {
        connection.stop();
        setConnection(null);
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0, 2s, 10s, 30s, then every 30s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.onreconnecting(() => {
      setConnectionState(signalR.HubConnectionState.Reconnecting);
      console.log('[SignalR] Reconnecting...');
    });

    newConnection.onreconnected(() => {
      setConnectionState(signalR.HubConnectionState.Connected);
      console.log('[SignalR] Reconnected');
    });

    newConnection.onclose(() => {
      setConnectionState(signalR.HubConnectionState.Disconnected);
      console.log('[SignalR] Disconnected');
    });

    setConnection(newConnection);

    // Start connection
    newConnection
      .start()
      .then(() => {
        setConnectionState(signalR.HubConnectionState.Connected);
        console.log('[SignalR] Connected');
      })
      .catch((err) => {
        console.error('[SignalR] Connection failed:', err);
        setConnectionState(signalR.HubConnectionState.Disconnected);
      });

    return () => {
      newConnection.stop();
    };
  }, [isAuthenticated]);

  // Subscribe to EventCreated
  const onEventCreated = useCallback(
    (callback: (event: Event) => void) => {
      if (!connection) return () => {};

      const handler = (event: Event) => callback(event);
      connection.on('EventCreated', handler);

      return () => {
        connection.off('EventCreated', handler);
      };
    },
    [connection]
  );

  // Subscribe to DecisionMade
  const onDecisionMade = useCallback(
    (callback: (decision: Decision) => void) => {
      if (!connection) return () => {};

      const handler = (decision: Decision) => callback(decision);
      connection.on('DecisionMade', handler);

      return () => {
        connection.off('DecisionMade', handler);
      };
    },
    [connection]
  );

  // Subscribe to UserStateChanged
  const onUserStateChanged = useCallback(
    (callback: (state: UserState) => void) => {
      if (!connection) return () => {};

      const handler = (state: UserState) => callback(state);
      connection.on('UserStateChanged', handler);

      return () => {
        connection.off('UserStateChanged', handler);
      };
    },
    [connection]
  );

  // Subscribe to RuleChanged
  const onRuleChanged = useCallback(
    (callback: (rule: Rule & { changeType: string }) => void) => {
      if (!connection) return () => {};

      const handler = (rule: Rule & { changeType: string }) => callback(rule);
      connection.on('RuleChanged', handler);

      return () => {
        connection.off('RuleChanged', handler);
      };
    },
    [connection]
  );

  // Subscribe to DashboardUpdate
  const onDashboardUpdate = useCallback(
    (callback: () => void) => {
      if (!connection) return () => {};

      const handler = () => callback();
      connection.on('DashboardUpdate', handler);

      return () => {
        connection.off('DashboardUpdate', handler);
      };
    },
    [connection]
  );

  return (
    <SignalRContext.Provider
      value={{
        connection,
        isConnected,
        connectionState,
        onEventCreated,
        onDecisionMade,
        onUserStateChanged,
        onRuleChanged,
        onDashboardUpdate,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalR() {
  const context = useContext(SignalRContext);
  if (context === undefined) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return context;
}
