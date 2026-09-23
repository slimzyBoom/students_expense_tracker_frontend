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

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// In-memory access token (No localStorage used!)
let inMemoryAccessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

// Initial default sample data matching design-reference.png for offline / demonstration resiliency

// Universal fetch wrapper
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const isAuthEndpoint =
    endpoint.includes("/auth/login") ||
    endpoint.includes("/auth/register") ||
    endpoint.includes("/auth/refresh-token");

  // If a token refresh is currently in flight, wait for it before sending
  if (refreshPromise && !endpoint.includes("/auth/refresh-token")) {
    await refreshPromise;
  }

  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (inMemoryAccessToken) {
    headers.set("Authorization", `Bearer ${inMemoryAccessToken}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (
      response.status === 401 &&
      !isRetry &&
      !isAuthEndpoint
    ) {
      const refreshed = await api.auth.refreshToken();
      if (refreshed) {
        return request<T>(endpoint, options, true);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Request failed with status ${response.status}`,
      );
    }

    const data = await response.json();
    return data.data !== undefined ? data.data : data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  auth: {
    async register(data: {
      name: string;
      email: string;
      password: string;
    }): Promise<{ user: User; token: string }> {
      const res = await request<{ user: User; accessToken: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      const token = res.accessToken || (res as any).token;
      setAccessToken(token);
      return { user: res.user, token };
    },

    async login(data: {
      email: string;
      password: string;
    }): Promise<{ user: User; token: string }> {
      const res = await request<{ user: User; accessToken: string }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      const token = res.accessToken || (res as any).token;
      setAccessToken(token);
      return { user: res.user, token };
    },

    async getMe(): Promise<User> {
      const res = await request<{ user?: User } | User>("/auth/me");
      if ("user" in res && res.user) return res.user;
      return res as User;
    },

    async refreshToken(): Promise<boolean> {
      if (refreshPromise) {
        return refreshPromise;
      }

      refreshPromise = (async () => {
        try {
          const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const data = await res.json();
            const token =
              data.data?.accessToken ||
              data.data?.token ||
              data.accessToken ||
              data.token;
            if (token) {
              setAccessToken(token);
              return true;
            }
          }
          setAccessToken(null);
          return false;
        } catch {
          setAccessToken(null);
          return false;
        } finally {
          refreshPromise = null;
        }
      })();

      return refreshPromise;
    },

    async logout(): Promise<void> {
      try {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } finally {
        setAccessToken(null);
      }
    },
  },

  accounts: {
    async getAll(): Promise<Account[]> {
      const accounts = await request<Account[]>("/accounts");
      return (accounts || []).map((a) => {
        const isCash = a.type === "CASH" || a.accountType === "CASH" || a.key === "CASH_WALLET";
        return {
          ...a,
          balance: a.current_balance ?? a.balance ?? 0,
          accountType: isCash ? ("CASH" as const) : ("BANK" as const),
          type: isCash ? ("CASH" as const) : ("BANK" as const),
        };
      });
    },

    async setStartingBalances(data: {
      bank_balance?: number;
      cash_balance?: number;
    }): Promise<Account[]> {
      const accounts = await request<Account[]>(
        "/accounts/starting-balances",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      return (accounts || []).map((a) => {
        const isCash = a.type === "CASH" || a.accountType === "CASH" || a.key === "CASH_WALLET";
        return {
          ...a,
          balance: a.current_balance ?? a.balance ?? 0,
          accountType: isCash ? ("CASH" as const) : ("BANK" as const),
          type: isCash ? ("CASH" as const) : ("BANK" as const),
        };
      });
    },
  },

  categories: {
    async getAll(): Promise<Category[]> {
      const res = await request<Category[]>("/categories");
      return res || [];
    },

    async create(data: {
      name: string;
      type: "INCOME" | "EXPENSE";
      color_code?: string;
    }): Promise<Category> {
      return await request<Category>("/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  transactions: {
    async getAll(params?: {
      limit?: number;
      page?: number;
      categoryId?: string;
      startDate?: string;
      endDate?: string;
      type?: "INCOME" | "EXPENSE" | "TRANSFER";
      account?: string;
    }): Promise<TransactionsResponse> {
      const query = new URLSearchParams();
      if (params?.limit) query.append("limit", String(params.limit));
      if (params?.page) query.append("page", String(params.page));
      if (params?.startDate) query.append("startDate", params.startDate);
      if (params?.endDate) query.append("endDate", params.endDate);
      if (params?.type) query.append("type", params.type);
      if (params?.categoryId) query.append("categoryId", params.categoryId);

      const endpoint = `/transactions${query.toString() ? `?${query.toString()}` : ""}`;
      const res = await request<any>(endpoint);

      const rawItems: any[] = Array.isArray(res) ? res : res.items || [];
      const total: number = Array.isArray(res) ? res.length : res.total ?? rawItems.length;

      const items: Transaction[] = rawItems.map((tx: any) => {
        // In the Express backend architecture:
        // - Manual entries are strictly CASH WALLET
        // - Bank transactions only come from STATEMENT_IMPORT
        const isCash =
          tx.accountType === "CASH" ||
          tx.source === "MANUAL" ||
          (!tx.source && !tx.import_hash) ||
          tx.type === "TRANSFER";

        return {
          ...tx,
          accountType: isCash ? ("CASH" as const) : ("BANK" as const),
          accountName: isCash ? "Cash Wallet" : "Main Bank Account",
          source: tx.source || (isCash ? "MANUAL" : "STATEMENT_IMPORT"),
        };
      });

      return {
        items,
        total,
        page: params?.page || 1,
        limit: params?.limit || 20,
      };
    },

    async createCash(data: {
      amount: number;
      category_id?: string | null;
      raw_narrative?: string;
      description?: string;
      type: "INCOME" | "EXPENSE";
      transaction_date?: string;
      date?: string;
    }): Promise<Transaction> {
      const payload = {
        amount: Number(data.amount),
        type: data.type,
        transaction_date:
          data.transaction_date || data.date || new Date().toISOString(),
        raw_narrative: data.raw_narrative || data.description || "Cash expense",
        category_id: data.category_id || undefined,
      };

      const created = await request<Transaction>("/transactions/cash", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return {
        ...created,
        accountType: "CASH",
        accountName: "Cash Wallet",
        source: "MANUAL",
      };
    },

    async createDailyCashLog(
      entries: Array<{
        amount: number;
        category_id?: string | null;
        raw_narrative?: string;
        description?: string;
        transaction_date?: string;
      }>,
    ): Promise<Transaction[]> {
      const payload = {
        entries: entries.map((e) => ({
          amount: Number(e.amount),
          transaction_date: e.transaction_date || new Date().toISOString(),
          raw_narrative:
            e.raw_narrative || e.description || "Campus Cash Expense",
          category_id: e.category_id || undefined,
        })),
      };

      const created = await request<Transaction[]>("/transactions/cash/daily-log", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return (created || []).map((tx) => ({
        ...tx,
        accountType: "CASH" as const,
        accountName: "Cash Wallet",
        source: "MANUAL" as const,
      }));
    },

    async create(data: Partial<Transaction>): Promise<Transaction> {
      const categoryIdStr =
        typeof data.category_id === "object" && data.category_id !== null
          ? (data.category_id as Category)._id
          : (data.category_id as string | null | undefined);

      const dateStr =
        typeof data.transaction_date === "string"
          ? data.transaction_date
          : data.transaction_date instanceof Date
            ? data.transaction_date.toISOString()
            : data.date || new Date().toISOString();

      const type =
        data.type === "INCOME" ? ("INCOME" as const) : ("EXPENSE" as const);

      return await this.createCash({
        amount: Number(data.amount),
        type,
        transaction_date: dateStr,
        raw_narrative:
          data.raw_narrative || data.description || "Manual Cash Transaction",
        category_id: categoryIdStr,
      });
    },

    async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
      return await request<Transaction>(`/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    async delete(id: string): Promise<void> {
      await request(`/transactions/${id}`, { method: "DELETE" });
    },
  },

  budgets: {
    async getAll(month?: string): Promise<Budget[]> {
      const queryMonth = month || new Date().toISOString().slice(0, 7);
      const res = await request<Budget[]>(`/budgets?month=${queryMonth}`);
      return (res || []).map((b) => ({
        ...b,
        limit: b.monthly_limit ?? b.limit ?? 0,
        monthly_limit: b.monthly_limit ?? b.limit ?? 0,
        month: b.month_year ?? b.month ?? queryMonth,
        status: b.state ?? b.status ?? "Safe",
      }));
    },

    async setBudget(data: {
      category_id: string;
      monthly_limit?: number;
      limit?: number;
      month_year?: string;
      month?: string;
    }): Promise<Budget> {
      const payload = {
        category_id: data.category_id,
        monthly_limit: Number(data.monthly_limit ?? data.limit),
        month_year:
          data.month_year || data.month || new Date().toISOString().slice(0, 7),
      };

      return await request<Budget>("/budgets", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },

  statements: {
    async parse(file: File): Promise<StatementParseResponse> {
      const formData = new FormData();
      formData.append("file", file);
      const rawRes = await request<ParsedCandidateItem[]>(
        "/statements/parse",
        {
          method: "POST",
          body: formData,
        },
      );

      const items = Array.isArray(rawRes)
        ? rawRes
        : (rawRes as any).items || [];
      const duplicatesFound = items.filter(
        (i: any) => i.duplicate || i.isDuplicate,
      ).length;

      return {
        items: items.map((item: any, idx: number) => ({
          ...item,
          tempId: item.import_hash || `stmt-${idx}`,
          date: item.transaction_date,
          description: item.raw_narrative,
          isDuplicate: item.duplicate ?? false,
        })),
        totalParsed: items.length,
        duplicatesFound,
      };
    },

    async confirm(
      items: ParsedCandidateItem[],
      rules: Array<{
        keyword: string;
        category_id?: string | null;
        target_type: "INCOME" | "EXPENSE" | "TRANSFER";
        priority?: number;
      }> = [],
    ): Promise<{ importedCount: number }> {
      const payload = {
        items: items
          .filter((i) => !i.duplicate && !i.isDuplicate)
          .map((i) => ({
            amount: Number(i.amount),
            type: i.type,
            transaction_date:
              i.transaction_date || i.date || new Date().toISOString(),
            raw_narrative: i.raw_narrative || i.description || "Statement item",
            import_hash: i.import_hash || "0".repeat(64),
            category_id: i.category_id || undefined,
          })),
        rules: rules.map((r) => ({
          keyword: r.keyword.trim(),
          category_id: r.category_id || undefined,
          target_type: r.target_type,
          priority: r.priority || 1,
        })),
      };

      const res = await request<any>("/statements/confirm", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return {
        importedCount:
          res.created ?? res.transactions ?? payload.items.length,
      };
    },

    async getRules(): Promise<CategorizationRule[]> {
      return await request<CategorizationRule[]>("/categories/rules");
    },

    async createRule(data: {
      keyword: string;
      target_type?: "INCOME" | "EXPENSE" | "TRANSFER";
      category_id?: string | null;
      priority?: number;
    }): Promise<CategorizationRule> {
      const payload = {
        keyword: data.keyword.trim(),
        target_type: data.target_type || "EXPENSE",
        category_id: data.category_id || undefined,
        priority: data.priority || 1,
      };

      return await request<CategorizationRule>("/categories/rules", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    async deleteRule(id: string): Promise<void> {
      await request(`/categories/rules/${id}`, { method: "DELETE" });
    },
  },

  analytics: {
    async getSummary(month?: string): Promise<FinancialSummary> {
      const queryMonth = month || new Date().toISOString().slice(0, 7);
      const endpoint = `/analytics/summary?month=${queryMonth}`;
      return await request<FinancialSummary>(endpoint);
    },

    async getDailyTrends(
      startDate?: string,
      endDate?: string,
    ): Promise<DailyTrend[]> {
      const query = new URLSearchParams();
      const start =
        startDate ||
        new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
      const end = endDate || new Date().toISOString().slice(0, 10);
      query.append("startDate", start);
      query.append("endDate", end);

      const endpoint = `/analytics/daily-trends?${query.toString()}`;
      const raw =
        await request<
          Array<{ _id: string; income: number; expense: number }>
        >(endpoint);

      return (raw || []).map((item) => ({
        _id: item._id,
        date: item._id,
        displayDate: item._id ? item._id.slice(5) : "",
        income: item.income || 0,
        expense: item.expense || 0,
        netWorth: (item.income || 0) - (item.expense || 0),
      }));
    },
  },
};
