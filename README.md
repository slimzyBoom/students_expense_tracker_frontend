# 🎓 Student Expense Tracker — Frontend Client

A modern, responsive financial dashboard built for university students to track out-of-pocket expenses, monitor dual-account balances (Cash Wallet vs. Main Bank Account), visualize monthly spending thresholds, and manage CSV bank statements.

Built with **Next.js 15**, **Tailwind CSS**, **Lucide React**, and **Recharts**, adhering strictly to the backend Express API specification.

---

## 🎨 Visual Design Specification

The UI is modeled directly after the high-fidelity financial dashboard specification:


### Theme & Styling Blueprint
* **Sidebar Navigation:** Deep navy/slate palette (`#1a164b` / `bg-slate-950`) with active pill indicator for current routes, brand header (**MyFin** / **StudentVault**), and user profile footer. On screens `< 768px`, smoothly collapses into a responsive hamburger slide-over sheet.
* **Canvas Background:** Soft off-white canvas (`bg-slate-50`).
* **Metric Cards & Data Surfaces:** Clean white backgrounds (`bg-white`), subtle border stroke (`border-slate-100`), smooth modern radius (`rounded-2xl`), and light elevation shadow (`shadow-sm`).
* **Typography:** Inter typography with bold tabular numbers for monetary figures (`font-semibold tracking-tight tabular-nums`).
* **Status Badges & Colors:**
  * Cash Wallet: Emerald badge (`bg-emerald-50 text-emerald-700 border-emerald-200`)
  * Bank Account: Indigo/Blue badge (`bg-indigo-50 text-indigo-700 border-indigo-200`)
  * Income: Positive green indicator (`+ $500.00`, text-emerald-600)
  * Expense: Negative slate/rose indicator (`-$78.20`, text-slate-900 / text-rose-600)

---

## 🛠️ Tech Stack & Skills

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React 19)
* **Language:** [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/) (`lucide-react`)
* **Charts & Visualizations:** [Recharts](https://recharts.org/) (`recharts`)
* **Form & Validation:** React Hook Form & Zod


---

## 📂 Project Architecture

```
student_expense_tracker_frontend/
├── .agent/
│   └── skills/
│       └── expense-frontend/
│           └── SKILL.md              # Agent skill definition for scaffolding & testing
├── design-reference.png              # UI visual design reference asset
├── public/                           # Static assets, icons, and branding
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── sign-in/page.tsx      # Login view
│   │   │   └── sign-up/page.tsx      # Registration view (auto-provisions CASH & BANK)
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Desktop sidebar + mobile responsive nav
│   │   │   ├── dashboard/page.tsx    # Accounts overview, daily trend chart, donut & recent transactions
│   │   │   ├── transactions/page.tsx # Ledger, quick cash modal & bulk daily log
│   │   │   ├── budgets/page.tsx      # Category threshold progress & budget setup
│   │   │   └── statements/page.tsx   # CSV drag-and-drop parse preview & rule manager
│   │   ├── layout.tsx                # Root layout, Inter font, Toast providers
│   │   └── page.tsx                  # Root redirect (to /dashboard or /sign-in)
│   ├── components/
│   │   ├── layout/                   # Sidebar, Navbar, Mobile Drawer, User Menu
│   │   ├── dashboard/                # NetWorthCard, DailyTrendsChart, BudgetDonut, RecentTxTable
│   │   ├── transactions/             # QuickCashModal, DailyCashLogModal, TransactionTable
│   │   ├── budgets/                  # BudgetProgressCard, SetBudgetModal
│   │   ├── statements/               # StatementDropzone, ParsedTxTable, RuleManagerDrawer
│   │   └── ui/                       # Button, Modal, Card, Badge, Input, Select
│   ├── context/                      # AuthContext, AccountContext
│   ├── lib/
│   │   ├── api.ts                    # Fetch wrapper with base URL & credentials: 'include'
│   │   └── utils.ts                  # Currency formatters, date helpers, cn class merge
│   └── types/                        # TypeScript API interfaces matching Express contracts
├── README.md                         # Design specification & API contract reference
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 📡 API Contract & Security Specifications

All client requests target the backend API at `http://localhost:3000/api/v1`.

### 🔒 Strict Security & Authentication Rules
1. **Cookie Auth:** Every `fetch` or `axios` call **MUST** include `credentials: "include"` so HttpOnly session cookies are transmitted cross-origin.
2. **Access Token Handling:** Access tokens (15m expiry) are stored in memory or short-lived storage; refresh tokens (7d expiry) rotate automatically via HttpOnly cookies.
3. **Route Protection:** Client-side auth provider redirects unauthenticated visits to `/sign-in`.

### 🔗 Endpoint Mappings by View

#### 1. Authentication (`/sign-in` & `/sign-up`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | Email & password authentication |
| `POST` | `/auth/register` | New student registration (auto-provisions `CASH` & `BANK` ledgers) |
| `POST` | `/auth/refresh-token` | Rotates session cookies and issues fresh access token |
| `POST` | `/auth/logout` | Revokes refresh session and clears HttpOnly cookies |
| `GET` | `/auth/me` | Fetches current user profile and role |

#### 2. Dashboard (`/dashboard`)
| Method | Endpoint | Component Target |
| :--- | :--- | :--- |
| `GET` | `/accounts` | Powers **Accounts Overview** total net balance, Cash Wallet & Bank balance pills |
| `GET` | `/analytics/daily-trends?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` | Feeds the Recharts interactive cash flow area/line chart |
| `GET` | `/analytics/summary?month=YYYY-MM` | Powers **Monthly Budget** central donut chart (Income, Expenses, Net Savings, Burn Rate) |
| `GET` | `/transactions?limit=5` | Populates the **Recent Transactions** table (5 newest rows) |

#### 3. Ledger & Cash Tracking (`/transactions`)
| Method | Endpoint | Component Target |
| :--- | :--- | :--- |
| `GET` | `/transactions?page=1&limit=20&category=&account=` | Paginated transaction history with filters |
| `POST` | `/transactions/cash` | **Quick Cash Log Modal** for rapid single pocket-money expense |
| `POST` | `/transactions/cash/daily-log` | **Daily Cash Log Modal** for batch campus spending entries |
| `PUT` | `/transactions/:id` | Update transaction with atomic double-entry balance adjustment |
| `DELETE` | `/transactions/:id` | Delete transaction with automatic balance rollback |

#### 4. Budgets & Threshold Indicators (`/budgets`)
| Method | Endpoint | Component Target |
| :--- | :--- | :--- |
| `GET` | `/budgets?month=YYYY-MM` | Monthly budget cards with usage progress bars |
| `POST` | `/budgets` | **Set Budget Modal** to configure category spending ceilings |

**Threshold Status Indicators:**
* `Safe` (< 80% used): Emerald green progress bar & badge.
* `Warning` (80% – 99% used): Amber/yellow progress bar & badge.
* `Exceeded` ($\ge$ 100% used): Rose/red progress bar & badge.

#### 5. Statements & Categorization Engine (`/statements`)
| Method | Endpoint | Component Target |
| :--- | :--- | :--- |
| `POST` | `/statements/parse` | Multipart CSV file drop (`file` field); returns parsed items and duplicate warnings |
| `POST` | `/statements/confirm` | Confirms and imports approved statement items into the ledger |
| `GET` | `/rules` | Lists keyword auto-categorization rules |
| `POST` | `/rules` | Creates a new auto-categorization rule |
| `DELETE` | `/rules/:id` | Deletes an auto-categorization rule |

---

## 🚦 Getting Started

### Prerequisites
* **Node.js** v18 or higher (v20+ recommended)
* Running backend API at `http://localhost:3000`

### Setup Steps
1. **Clone & Navigate:**
   ```bash
   cd student_expense_tracker_frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create `.env.local` in the project root:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3001](http://localhost:3001) (or next available port) to access the application.

