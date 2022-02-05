# API Project Template

An API project template built using NestJS, Prisma, and SuperTokens.

### Requirements

- Postgres database, specified as `DATABASE_URL` in .env
- [SuperTokens Core](https://supertokens.com/docs/session/quick-setup/core/without-docker), specified as `SESSION_TOKENS_API_DOMAIN` in .env

---

### Useful documentation

- [NestJS documentation](https://docs.nestjs.com/first-steps)
- [SuperTokens session recipe guide](https://supertokens.com/docs/session/introduction)
- [Prisma guides & references](https://www.prisma.io/docs/guides)

---

### Implementation checklist
- [x] Bootstrap NestJS
- [x] Simple Prisma schema, module
- [x] ST session recipe
- [x] ST email verification logic
- [ ] SMTP service
- [ ] RBAC authorization