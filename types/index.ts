// Core Trading Types
export interface TradingPair {
  symbol: string;
  base: string;
  quote: string;
  displayName: string;
  precision: number;
  minTradeAmount: number;
  maxTradeAmount: number;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface Price {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  timestamp: string;
  change24h: number;
  changePercent24h: number;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  amount: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  createdAt: string;
  updatedAt: string;
  filledAmount: number;
  remainingAmount: number;
  averagePrice?: number;
  fees: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface Position {
  id: string;
  userId: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  margin: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  userId: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
  leverage: number;
  createdAt: string;
  updatedAt: string;
}

// Bot and Strategy Types
export interface TradingBot {
  id: string;
  userId: string;
  name: string;
  strategy: TradingStrategy;
  status: 'active' | 'paused' | 'stopped' | 'error';
  symbol: string;
  balance: number;
  profit: number;
  loss: number;
  winRate: number;
  totalTrades: number;
  settings: BotSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TradingStrategy {
  id: string;
  name: string;
  type: 'scalping' | 'dca' | 'grid' | 'trend_following' | 'mean_reversion';
  description: string;
  parameters: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: string;
  indicators: TechnicalIndicator[];
}

export interface BotSettings {
  maxDrawdown: number;
  dailyLossLimit: number;
  riskPerTrade: number;
  maxOpenPositions: number;
  tradingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface TechnicalIndicator {
  name: string;
  type: 'trend' | 'momentum' | 'volatility' | 'volume';
  parameters: Record<string, number>;
  signal: 'buy' | 'sell' | 'neutral';
  value: number;
  timestamp: string;
}

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'user' | 'premium' | 'admin';
  subscription: Subscription;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  features: string[];
}

export interface UserPreferences {
  language: 'en' | 'id';
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  trading: {
    defaultLeverage: number;
    confirmOrders: boolean;
    soundAlerts: boolean;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Market Data Types
export interface MarketData {
  symbol: string;
  price: Price;
  candles: Candle[];
  orderBook: OrderBook;
  trades: Trade[];
  statistics: MarketStatistics;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: string;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface Trade {
  id: string;
  symbol: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

export interface MarketStatistics {
  symbol: string;
  high24h: number;
  low24h: number;
  volume24h: number;
  volumeQuote24h: number;
  change24h: number;
  changePercent24h: number;
  vwap24h: number;
  timestamp: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'trade' | 'order' | 'system' | 'alert' | 'news';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'price' | 'order' | 'position' | 'notification' | 'system';
  data: any;
  timestamp: string;
}

export interface WebSocketSubscription {
  channel: string;
  symbol?: string;
  callback: (data: any) => void;
}

// Component Props Types
export interface ChartProps {
  symbol: string;
  timeframe: string;
  height?: number;
  showVolume?: boolean;
  showIndicators?: boolean;
  onPriceUpdate?: (price: Price) => void;
}

export interface OrderPanelProps {
  symbol: string;
  currentPrice: Price;
  accountBalance: number;
  onPlaceOrder: (order: Partial<Order>) => Promise<void>;
}

export interface PositionTableProps {
  positions: Position[];
  onClosePosition: (positionId: string) => Promise<void>;
  onModifyPosition: (positionId: string, updates: Partial<Position>) => Promise<void>;
}

// Utility Types
export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'rejected';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK';
export type BotStatus = 'active' | 'paused' | 'stopped' | 'error';
export type StrategyType = 'scalping' | 'dca' | 'grid' | 'trend_following' | 'mean_reversion';
export type RiskLevel = 'low' | 'medium' | 'high';
export type NotificationType = 'trade' | 'order' | 'system' | 'alert' | 'news';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface BotCreateForm {
  name: string;
  strategy: StrategyType;
  symbol: string;
  balance: number;
  riskLevel: RiskLevel;
  settings: Partial<BotSettings>;
}

export interface OrderForm {
  symbol: string;
  type: OrderType;
  side: OrderSide;
  amount: number;
  price?: number;
  stopPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  timeInForce: TimeInForce;
}

// Hook Types
export interface UseWebSocketReturn {
  isConnected: boolean;
  subscribe: (subscription: WebSocketSubscription) => void;
  unsubscribe: (channel: string) => void;
  send: (message: WebSocketMessage) => void;
}

export interface UseMarketDataReturn {
  data: MarketData | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export interface UseTradingBotReturn {
  bots: TradingBot[];
  loading: boolean;
  error: ApiError | null;
  createBot: (bot: BotCreateForm) => Promise<TradingBot>;
  updateBot: (id: string, updates: Partial<TradingBot>) => Promise<TradingBot>;
  deleteBot: (id: string) => Promise<void>;
  startBot: (id: string) => Promise<void>;
  stopBot: (id: string) => Promise<void>;
}