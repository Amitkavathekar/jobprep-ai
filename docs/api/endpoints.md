# Endpoints

All paths below are relative to `/api/v1`. Unless marked **Public**, provide a bearer token. Controllers define the detailed payload and response shapes.

| Method | Path                           | Access        | Purpose                                            |
| ------ | ------------------------------ | ------------- | -------------------------------------------------- |
| POST   | `/auth/register`               | Public        | Register an account                                |
| POST   | `/auth/login`                  | Public        | Log in                                             |
| GET    | `/auth/me`                     | Authenticated | Get the current authenticated user                 |
| GET    | `/users/profile`               | Authenticated | Read profile                                       |
| PUT    | `/users/profile`               | Authenticated | Update profile                                     |
| GET    | `/users`                       | Admin         | List users                                         |
| POST   | `/ats/analyze`                 | Authenticated | Analyze uploaded resume (`resume` multipart field) |
| GET    | `/ats/reports`                 | Authenticated | List ATS reports                                   |
| GET    | `/ats/reports/:id`             | Authenticated | Read an ATS report                                 |
| POST   | `/mock-interview/start`        | Authenticated | Create an interview session                        |
| POST   | `/mock-interview/evaluate`     | Authenticated | Evaluate an answer                                 |
| GET    | `/mock-interview/sessions`     | Authenticated | List interview sessions                            |
| GET    | `/mock-interview/sessions/:id` | Authenticated | Read an interview session                          |
| POST   | `/resume`                      | Authenticated | Create a resume                                    |
| GET    | `/resume`                      | Authenticated | List resumes                                       |
| GET    | `/resume/:id`                  | Authenticated | Read a resume                                      |
| PUT    | `/resume/:id`                  | Authenticated | Update a resume                                    |
| DELETE | `/resume/:id`                  | Authenticated | Delete a resume                                    |
| POST   | `/ai-analysis/career-advice`   | Authenticated | Request career advice                              |
| GET    | `/reports/dashboard`           | Authenticated | Read dashboard statistics                          |
| POST   | `/payments/create-order`       | Authenticated | Create a payment order                             |
| POST   | `/payments/verify`             | Authenticated | Verify a payment                                   |
| GET    | `/subscriptions/my-plan`       | Authenticated | Read the current plan                              |
| GET    | `/admin/analytics`             | Admin         | Read administrative analytics                      |

The health check is `GET /health` (outside `/api/v1`) and does not require authentication.
