# @leomensil/radarinvest-contracts

Tipos TypeScript e schemas Zod gerados a partir de [`../../04-api-contracts/openapi.yaml`](../../04-api-contracts/openapi.yaml).

Ver [ADR-0001](../../02-architecture/adr/0001-contract-distribution.md) e [03-contract-distribution.md](../../02-architecture/03-contract-distribution.md).

## Generate

```bash
cd packages/contracts
npm install
npm run generate
```

## Publish

Feito pelo workflow `.github/workflows/publish-contracts.yml` em push para `main` (paths do contrato) ou tag `contracts-v*`.

## Consume

```ts
import type { components } from "@leomensil/radarinvest-contracts";
import { schemas } from "@leomensil/radarinvest-contracts/zod";
```
