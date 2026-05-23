# AAVIE Admin Panel

React + Vite admin panel for the AAVIE Women's Health platform.
Manages users, assessments, and articles. Full dark/light mode support.

---

## Quick start

```bash
cd aavie-admin
cp .env.example .env          # set VITE_API_BASE to your Spring Boot URL
npm install
npm run dev                   # runs on http://localhost:3000
```

---

## Tech stack

| Concern        | Library                       |
|----------------|-------------------------------|
| Build          | Vite 5 + React 18             |
| Routing        | React Router v6               |
| Server state   | TanStack Query v5             |
| Global state   | Zustand (persisted)           |
| Forms          | React Hook Form + Zod         |
| HTTP client    | Axios (JWT interceptor built in) |
| Icons          | Tabler Icons webfont          |
| Fonts          | DM Sans + DM Serif Display    |

---

## Folder structure

```
src/
├── api/
│   ├── client.js          ← Axios instance with JWT interceptor
│   ├── auth.js            ← POST /api/auth/login
│   ├── users.js           ← GET /api/admin/users, stats, dashboard
│   └── articles.js        ← Full CRUD for articles
├── components/
│   ├── Layout.jsx         ← Sidebar, Topbar, StatCard, Panel, etc.
│   └── Layout.module.css
├── hooks/
│   └── index.js           ← TanStack Query hooks for all API calls
├── modules/
│   ├── auth/LoginPage.jsx
│   ├── dashboard/DashboardPage.jsx
│   ├── users/
│   │   ├── UsersPage.jsx
│   │   └── AssessmentsPage.jsx
│   └── articles/
│       ├── ArticlesPage.jsx
│       └── PublishPage.jsx
├── store/index.js         ← Zustand: auth + theme + toasts
├── styles/global.css      ← CSS variables for light + dark mode
├── App.jsx                ← Router + RequireAuth guard
└── main.jsx
```

---

## Spring Boot endpoints — existing (already built)

| Method | Path                                  | Used by                |
|--------|---------------------------------------|------------------------|
| POST   | /api/auth/login                       | Login page             |
| GET    | /api/assessments/status/{userId}      | User detail view       |

---

## Spring Boot endpoints — NEW (add to your backend)

### 1. Admin user endpoints

```java
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    // GET /api/admin/users?page=0&size=50&search=
    @GetMapping("/users")
    public Page<UserAdminDTO> getUsers(
        @RequestParam(defaultValue="0") int page,
        @RequestParam(defaultValue="50") int size,
        @RequestParam(required=false) String search
    ) { ... }

    // GET /api/admin/users/stats
    @GetMapping("/users/stats")
    public UserStatsDTO getUserStats() { ... }

    // GET /api/admin/dashboard/stats
    @GetMapping("/dashboard/stats")
    public DashboardStatsDTO getDashboardStats() { ... }

    // GET /api/admin/assessments/overview
    @GetMapping("/assessments/overview")
    public AssessmentOverviewDTO getAssessmentOverview() { ... }
}
```

### 2. Article entity (new JPA entity)

```java
@Entity
@Table(name = "articles")
public class Article {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String category;
    private String ageGroup;   // "18-24" | "25-30" | "31-35" | "36-45" | "all"
    @Column(columnDefinition = "TEXT")
    private String body;
    private String imageUrl;
    private String readTime;
    private String status;     // "live" | "draft"
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 3. Article controller

```java
@RestController
public class ArticleController {

    // Admin CRUD (JWT required)
    @GetMapping("/api/admin/articles")
    @PostMapping("/api/admin/articles")
    @GetMapping("/api/admin/articles/{id}")
    @PutMapping("/api/admin/articles/{id}")
    @DeleteMapping("/api/admin/articles/{id}")
    @GetMapping("/api/admin/articles/stats")

    // Public — no auth, used by Expo app
    @GetMapping("/api/public/articles")  // ?ageGroup=18-24
}
```

### 4. Add ADMIN role to JWT

In your `SecurityConfig`, add the ADMIN role check:
```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.requestMatchers("/api/public/**").permitAll()
```

In `UserProfile`, add a `role` field:
```java
private String role = "USER";  // or "ADMIN"
```

---

## Authentication flow

1. Admin logs in via `POST /api/auth/login` (same Spring Boot endpoint)
2. JWT token stored in `localStorage` via Zustand persist
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. 401 responses automatically redirect to `/login`

---

## Theme

- Light/dark toggle in the bottom-left sidebar
- Preference persisted in `localStorage`
- CSS variables switch on `[data-theme="dark"]` attribute on `<html>`
- All colours, borders, and backgrounds adapt automatically
