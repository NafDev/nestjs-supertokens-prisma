# API Project Template

An API project template built using NestJS, Prisma, and SuperTokens.

### Requirements

- Postgres database, specified as `DATABASE_URI` in `.env`
- [SuperTokens Core](https://supertokens.com/docs/session/quick-setup/core/without-docker), specified as `ST_CORE_URL` in `.env`

---

### Notes

- Include your own production logging stream for `pino` under `app.module.ts`
- This template makes use of the Session and Email Verification recipes from SuperTokens. No other data other than active sessions should be stored by the SuperTokens schema. Password resets are handled manually (see `src/api/auth/auth.controller.ts`)
- In addition to your own endpoints, SuperTokens will open the following routes to your API, as configured in `src/api/auth/supertokens/supertokens.service.ts`

| Method | Email Verification Recipe Endpoint |
| ------ | -------- |
| POST   | { apiBasePath }/user/email/verify/token |
| POST   | { apiBasePath }/user/email/verify |
| GET    | { apiBasePath }/user/email/verify |

| Method | Session Recipe Endpoint |
| ------ | -------- |
| POST   | { apiBasePath }/signout |
| POST   | { apiBasePath }/session/refresh |
---

### Useful documentation

- [NestJS documentation](https://docs.nestjs.com/first-steps)
- [SuperTokens session recipe guide](https://supertokens.com/docs/session/introduction)
- [Prisma guides & references](https://www.prisma.io/docs/guides)
