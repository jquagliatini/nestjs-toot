# Nestjs TOOTS

An opinionated, strongly-typed production ready app.

## Principles

Event driven: Each mutation, is made thanks to a [message](./packages/internal/messages/)

CQS: Mutations are event driven, but queries access the data directly. Each are invoked thanks to [dispatchables](./packages/internal/dispatchable/) and could be asynchronous

Observability: [Open Telemetry](./packages/internal/otel) as an observability standard

Branded Id Store: not wrapped string, but still strongly typed Ids, thanks to [humanid](./packages/internal/humanid/)

Diamond testing: Acceptance tests that use a real Server, Db and the HTTP layer, thanks to http://heyapi.dev/, in [sdk](./packages/internal/sdk) and https://vitest.dev in [e2e](./packages/e2e).

## Entrypoint

the CLI is the entrypoint:

```sh
cd packages/cli
node src/cli serve --config ./config.json # starts on :3000
```
