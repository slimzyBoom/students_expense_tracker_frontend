import {
  Account,
  Budget,
  Category,
  CategorizationRule,
  DailyTrend,
  FinancialSummary,
  ParsedCandidateItem,
  StatementParseResponse,
  Transaction,
  TransactionsResponse,
  User,
} from "@/types/api";

export const MOCK_USER: User = {
  id: "user-1",
  name: "Lucas Walker",
  email: "lucas.walker@university.edu",
};

export const MOCK_CATEGORIES: Category[] = [
  { _id: "673f19e13c847a61d84b2301", name: "Groceries", type: "EXPENSE", color_code: "#16A34A" },
  { _id: "673f19e13c847a61d84b2302", name: "Food & Dining", type: "EXPENSE", color_code: "#F97316" },
  { _id: "673f19e13c847a61d84b2303", name: "Transport & Gas", type: "EXPENSE", color_code: "#3B82F6" },
  { _id: "673f19e13c847a61d84b2304", name: "Entertainment", type: "EXPENSE", color_code: "#8B5CF6" },
  { _id: "673f19e13c847a61d84b2305", name: "Fitness & Hobbies", type: "EXPENSE", color_code: "#EC4899" },
  { _id: "673f19e13c847a61d84b2306", name: "Books & Supplies", type: "EXPENSE", color_code: "#06B6D4" },
  { _id: "673f19e13c847a61d84b2307", name: "Other income", type: "INCOME", color_code: "#10B981" },
  { _id: "673f19e13c847a61d84b2308", name: "Salary / Stipend", type: "INCOME", color_code: "#059669" },
];

export const MOCK_ACCOUNTS: Account[] = [
  {
    _id: "acc-bank-1",
    userId: "user-1",
    accountType: "BANK",
    name: "US Bank (0992)",
    balance: 21326.54,
  },
  {
    _id: "acc-cash-1",
    userId: "user-1",
    accountType: "CASH",
    name: "Wallet Cash",
    balance: 3200.0,
  },
];

export const MOCK_DAILY_TRENDS: DailyTrend[] = [
  { date: "2023-06-01", displayDate: "Jun 1", income: 5500, expense: 420, netWorth: 18200 },
  { date: "2023-06-05", displayDate: "Jun 5", income: 0, expense: 310, netWorth: 19800 },
  { date: "2023-06-10", displayDate: "Jun 10", income: 0, expense: 540, netWorth: 17400 },
  { date: "2023-06-15", displayDate: "Jun 15", income: 1200, expense: 650, netWorth: 20100 },
  { date: "2023-06-18", displayDate: "Jun 18", income: 0, expense: 410, netWorth: 18900 },
  { date: "2023-06-22", displayDate: "Jun 22", income: 3000, expense: 220, netWorth: 21373.42 },
  { date: "2023-06-25", displayDate: "Jun 25", income: 0, expense: 780, netWorth: 22400 },
  { date: "2023-06-30", displayDate: "Jun 30", income: 800, expense: 190, netWorth: 24526.54 },
];

export const MOCK_SUMMARY: FinancialSummary = {
  totalIncome: 5500,
  totalExpense: 3952,
  netSavings: 1000,
  burnRate: 71.85,
  month: "2023-06",
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    _id: "tx-1",
    from_account_id: "acc-bank-1",
    accountName: "US Bank (0992)",
    accountType: "BANK",
    type: "EXPENSE",
    amount: 78.2,
    category: "Groceries",
    raw_narrative: "Walmart",
    description: "Walmart",
    transaction_date: "2023-05-20",
    date: "2023-05-20",
  },
  {
    _id: "tx-2",
    to_account_id: "acc-cash-1",
    accountName: "Wallet Cash",
    accountType: "CASH",
    type: "INCOME",
    amount: 500.0,
    category: "Other income",
    raw_narrative: "Fiverr International",
    description: "Fiverr International",
    transaction_date: "2023-05-19",
    date: "2023-05-19",
  },
  {
    _id: "tx-3",
    from_account_id: "acc-bank-1",
    accountName: "Revolut (4922)",
    accountType: "BANK",
    type: "EXPENSE",
    amount: 100.0,
    category: "Transport & Gas",
    raw_narrative: "Chevron",
    description: "Chevron",
    transaction_date: "2023-05-19",
    date: "2023-05-19",
  },
  {
    _id: "tx-4",
    from_account_id: "acc-cash-1",
    accountName: "Wallet Cash",
    accountType: "CASH",
    type: "EXPENSE",
    amount: 200.0,
    category: "Entertainment",
    raw_narrative: "Cinema",
    description: "Cinema",
    transaction_date: "2023-05-18",
    date: "2023-05-18",
  },
  {
    _id: "tx-5",
    from_account_id: "acc-bank-1",
    accountName: "US Bank (0992)",
    accountType: "BANK",
    type: "EXPENSE",
    amount: 200.0,
    category: "Fitness & Hobbies",
    raw_narrative: "Gold's Gym",
    description: "Gold's Gym",
    transaction_date: "2023-05-15",
    date: "2023-05-15",
  },
];

export const MOCK_BUDGETS: Budget[] = [
  {
    _id: "b-1",
    category_id: "673f19e13c847a61d84b2301",
    category: "Groceries",
    monthly_limit: 450,
    limit: 450,
    spent: 312.8,
    percentage: 69.5,
    state: "Safe",
    status: "Safe",
    month_year: "2023-06",
    month: "2023-06",
  },
  {
    _id: "b-2",
    category_id: "673f19e13c847a61d84b2302",
    category: "Food & Dining",
    monthly_limit: 300,
    limit: 300,
    spent: 265.0,
    percentage: 88.3,
    state: "Warning",
    status: "Warning",
    month_year: "2023-06",
    month: "2023-06",
  },
  {
    _id: "b-3",
    category_id: "673f19e13c847a61d84b2304",
    category: "Entertainment",
    monthly_limit: 150,
    limit: 150,
    spent: 168.0,
    percentage: 112.0,
    state: "Exceeded",
    status: "Exceeded",
    month_year: "2023-06",
    month: "2023-06",
  },
  {
    _id: "b-4",
    category_id: "673f19e13c847a61d84b2303",
    category: "Transport & Gas",
    monthly_limit: 200,
    limit: 200,
    spent: 140.0,
    percentage: 70.0,
    state: "Safe",
    status: "Safe",
    month_year: "2023-06",
    month: "2023-06",
  },
];

export const MOCK_RULES: CategorizationRule[] = [
  { _id: "r-1", keyword: "walmart", target_type: "EXPENSE", category: "Groceries" },
  { _id: "r-2", keyword: "chevron", target_type: "EXPENSE", category: "Transport & Gas" },
  { _id: "r-3", keyword: "fiverr", target_type: "INCOME", category: "Other income" },
  { _id: "r-4", keyword: "gym", target_type: "EXPENSE", category: "Fitness & Hobbies" },
  { _id: "r-5", keyword: "cinema", target_type: "EXPENSE", category: "Entertainment" },
];


