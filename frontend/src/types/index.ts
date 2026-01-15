export interface User {
  userId: string;
  name: string;
  city: string;
  email?: string;
  role?: 'User' | 'Admin' | 'Presenter';
}

export interface Event {
  eventId: string;
  userId: string;
  userName?: string;
  service: string;
  eventType: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface UserState {
  userId: string;
  userName?: string;
  city?: string;
  internetTodayGb: number;
  spendTodayTry: number;
  contentMinutesToday: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastUpdated: string;
}

export interface Rule {
  ruleId: string;
  condition: string;
  action: string;
  message: string; // Kullanıcıya gösterilecek mesaj
  priority: number;
  isActive: boolean;
}

export interface Decision {
  decisionId: string;
  userId: string;
  userName?: string;
  triggeredRules: string[];
  selectedAction: string;
  suppressedActions: string[];
  message: string; // Kullanıcıya gösterilecek mesaj
  timestamp: string;
}

export interface DashboardSummary {
  totalUsers: number;
  totalEventsToday: number;
  totalDecisionsToday: number;
  activeRules: number;
  actionCountsToday: Record<string, number>;
  riskLevelDistribution: Record<string, number>;
  recentEvents: Event[];
  recentDecisions: Decision[];
}

export interface CreateEventDto {
  eventId?: string;
  userId: string;
  service: string;
  eventType: string;
  value: number;
  unit: string;
  timestamp?: string;
}

export interface CreateRuleDto {
  ruleId?: string;
  condition: string;
  action: string;
  message: string;
  priority: number;
  isActive: boolean;
}

export interface ProcessEventResult {
  event: Event;
  userState: UserState;
  decision?: Decision;
}

// Auth types
export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  name: string;
  role: 'User' | 'Admin' | 'Presenter';
  expiresAt: string;
}

export interface AuthUser {
  userId: string;
  name: string;
  role: 'User' | 'Admin' | 'Presenter';
  city?: string;
  email?: string;
}

export interface CreateUserDto {
  userId: string;
  name: string;
  city: string;
  email?: string;
  password: string;
  role: string;
}

export interface UpdateUserDto {
  name?: string;
  city?: string;
  email?: string;
  password?: string;
  role?: string;
}

// Simulation types
export interface SimulationServiceConfig {
  name: string;
  eventType: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  aggressiveMin: number;
  aggressiveMax: number;
}

export interface SimulationConfig {
  services: SimulationServiceConfig[];
  aggressiveProbability: number;
  defaultIntervalSeconds: number;
  minIntervalSeconds: number;
  maxIntervalSeconds: number;
}

// UI Config types
export interface ActionLabelConfig {
  label: string;
  color: string;
  title: string;
  defaultMessage: string;
}

export interface RiskLabelConfig {
  label: string;
  color: string;
}

export interface UiConfig {
  actionLabels: Record<string, ActionLabelConfig>;
  riskLabels: Record<string, RiskLabelConfig>;
  fallbackMessage: string;
  defaultNotificationTitle: string;
  defaultNotificationMessage: string;
}

// Scenario types
export interface ScenarioEvent {
  userId: string;
  service: string;
  eventType: string;
  value: number;
  unit: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  color: string;
  events: ScenarioEvent[];
}

export interface ScenariosResponse {
  scenarios: Scenario[];
}

// LLM Rule Generation types
export interface GenerateRuleRequest {
  prompt: string;
}

export interface GeneratedRule {
  condition: string;
  action: string;
  message: string;
  explanation?: string;
}
