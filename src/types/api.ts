export type AccountType = "CASH" | "BANK";
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type BudgetStatus = "Safe" | "Warning" | "Exceeded";

export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  createdAt?: string;
}

export interface Account {
  _id: string;
  id?: string;
  user_id?: string;
  userId?: string;
  name: string;
  type?: AccountType;
  accountType?: AccountType;
  key?: "CASH_WALLET" | "MAIN_BANK_ACCOUNT" | null;
  current_balance?: number;
  balance: number;
  created_at?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color_code?: string;
  user_id?: string | null;
}

export interface Transaction {
  _id: string;
  id?: string;
  user_id?: string;
  from_account_id?: string | null;
  to_account_id?: string | null;
  category_id?: Category | string | null;
  amount: number;
  type: TransactionType;
  transaction_date?: string | Date;
  date?: string;
  raw_narrative?: string | null;
  description?: string;
  source?: "MANUAL" | "STATEMENT_IMPORT";
  import_hash?: string | null;
  // UI helper fields
  accountName?: string;
  accountType?: AccountType;
  accountId?: string;
  category?: string;
  createdAt?: string;
}

export interface TransactionsResponse {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface Budget {
  _id: string;
  id?: string;
  category_id?: string;
  category?: Category | string;
  monthly_limit?: number;
  limit?: number;
  spent: number;
  percentage: number;
  month_year?: string;
  month?: string; // YYYY-MM
  state?: BudgetStatus;
  status?: BudgetStatus;
}

export interface CategorizationRule {
  _id: string;
  id?: string;
  user_id?: string;
  keyword: string;
  category_id?: Category | string | null;
  category?: string;
  target_type: "INCOME" | "EXPENSE" | "TRANSFER";
  priority?: number;
  createdAt?: string;
}

export interface ParsedCandidateItem {
  transaction_date: string;
  amount: number;
  raw_narrative: string;
  type: TransactionType;
  category_id?: string | null;
  import_hash: string;
  pre_registration?: boolean;
  duplicate: boolean;
  // UI helpers
  tempId?: string;
  date?: string;
  description?: string;
  category?: string;
  isDuplicate?: boolean;
  duplicateReason?: string;
}

export type ParsedStatementItem = ParsedCandidateItem;

export interface StatementParseResponse {
  totalParsed?: number;
  duplicatesFound?: number;
  items: ParsedCandidateItem[];
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  burnRate: number;
  month?: string;
}

export interface CategoryBreakdown {
  category_id?: string;
  name?: string;
  category?: string;
  color_code?: string;
  amount?: number;
  total?: number;
  percentage: number;
}

export interface DailyTrend {
  _id?: string; // Backend date key (e.g. "2026-09-01")
  date: string;
  displayDate?: string;
  income: number;
  expense: number;
  netWorth?: number;
}
