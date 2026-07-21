# AWS Config Executor

[![npm](https://img.shields.io/npm/v/@pureskillgg/ace.svg)](https://www.npmjs.com/package/@pureskillgg/ace)
[![docs](https://img.shields.io/badge/docs-online-informational)](https://dev.pureskill.gg/ace/)
[![GitHub Actions](https://github.com/pureskillgg/ace/workflows/main/badge.svg)](https://github.com/pureskillgg/ace/actions)

Loads and caches configuration and secrets from AWS services.

`@pureskillgg/ace` ("AWS Config Executor") is a small Node.js ESM library that
resolves, validates, parses, and caches application configuration and secrets
from [AWS SSM Parameter Store], [AWS Secrets Manager], environment variables, and
in-memory local values. A service declares the parameters it needs and calls a
single async `getConfig`; ace fetches them all in parallel, caches them, logs the
resolution, and hands back a plain object of resolved values.

## What it does

A caller declares a map of named parameters and calls `getConfig`:

```js
import { ssmString, secretsManagerString, getConfig } from '@pureskillgg/ace'

const parameters = {
  bucketArn: ssmString('/app/bucket_arn'),
  apiKey: secretsManagerString('/app/api_key')
}

const { bucketArn, apiKey } = await getConfig({ parameters })
```

`getConfig({ parameters, aliases, cache, log, ...providerDependencies })`
(`lib/get-config.js`) fetches every entry in parallel (`Promise.all` over
`Object.entries(parameters)`) and returns an object of resolved values keyed by
the caller's own names. Each fetch is:

- **Cached** through [cache-manager] (`cache.wrap(name, …)`). The default cache is
  in-memory and lives only for one call; to persist values across (e.g.) lambda
  invocations, pass a shared `cache` created in the outer scope. Note the cache
  key is the caller-supplied object key (`name`), **not** the resolved SSM/secret
  path or the alias — two parameters that share a name on a shared cache will
  collide.
- **Logged** via [@pureskillgg/mlabs-logger] ([Pino]) with a child logger carrying
  `paramName` / `paramAlias` / `paramKey` / `paramProvider`. Sensitive values
  (Secrets Manager) are redacted as `[Redacted]` in debug logs. On failure each
  fetch logs `log.error({ err }, 'fail')` and rethrows.

Each parameter is a `Parameter` instance (`lib/parameter.js`) configured with a
provider class, an optional `fallback`, a `parser` (default identity), a
`validator` (default always-true), and an `isSensitive` flag. On `get(key)` it
lazily instantiates the provider (`initProvider`, passed the provider
dependencies from `getConfig` such as `ssmClient` / `secretsManagerClient` /
`env` / `localParameters`), fetches the raw value, applies the fallback when the
provider returns nothing, runs the parser (throwing `ParameterParsingError`,
code `err_parameter_parse`, on failure), then runs the validator (throwing
`ParameterValidationError`, code `err_parameter_validate`, on failure).

**Key resolution and aliases.** An explicit `parameter.alias` wins; otherwise the
parameter name is looked up in the `aliases` map (commonly `{ ...process.env }`).
This enables indirection such as `BUCKET_ARN_SSM_PATH` -> the actual SSM path,
so deployment config can point at parameters without code changes.

### Description

- Resolve configuration from multiple source:
  - [AWS SSM parameter store].
  - [AWS Secrets Manager].
  - Local memory.
- Structured logging with [Pino] via [mlabs-logger].
- Cache parameter values with [cache-manager].
- Parameter key aliases (see usage below).

[AWS SSM parameter store]: https://aws.amazon.com/systems-manager/
[AWS Secrets Manager]: https://aws.amazon.com/secrets-manager/
[Pino]: https://getpino.io/
[mlabs-logger]: https://github.com/meltwater/mlabs-logger
[@pureskillgg/mlabs-logger]: https://www.npmjs.com/package/@pureskillgg/mlabs-logger
[cache-manager]: https://github.com/BryanDonovan/node-cache-manager

## Pipeline role

ace is a shared infrastructure utility, **not** a pipeline stage. It is published
to npm and imported by other PureSkill.gg Node backend services (e.g. `glhf`,
`oauthjs`, and the lambdas behind demo/replay/match processing and automatch) so
they can load their runtime config and secrets — bucket ARNs, API keys,
Steam/FACEIT credentials, polling intervals such as automatch `min_interval`, and
so on — from AWS at boot. It produces no domain data of its own; it sits
underneath nearly every Node service as the config-resolution layer.

It owns no cloud infrastructure. There is no `serverless.yml`, no Terraform, and
no CDK in this repo. At runtime it only **reads** from two AWS services via AWS
SDK v3 clients, using resource names that the consuming application supplies at
call time.

## Exported helpers, providers, and resources

### Entry point

| Export | Source | Role |
| --- | --- | --- |
| `getConfig` | `lib/get-config.js` | Async. Resolves a map of named `Parameter`s in parallel (cached + logged) and returns an object of resolved values keyed by caller name. |
| `Parameter` | `lib/parameter.js` | Core abstraction wrapping a provider with `fallback`, `parser`, `validator`, and `isSensitive`. Lazily instantiates its provider, fetches, parses, and validates. Throws `ParameterValidationError` / `ParameterParsingError`. |

### Factory helpers (`lib/factories.js`)

Each factory wires a provider plus an appropriate validator/parser. By convention
parameters are referenced by the caller's `camelCase` object key; secret-bearing
helpers set `isSensitive: true` so values are redacted in logs.

| Factory | Provider | Validation / parsing |
| --- | --- | --- |
| `ssmString(name, fallback)` | `SsmProvider` | non-empty string |
| `ssmNonNegativeInt(name, fallback)` | `SsmProvider` | `Number(v)`, must be a non-negative integer |
| `secretsManagerString(name, fallback)` | `SecretsManagerProvider` | non-empty string, **sensitive** |
| `secretsManagerJson(name, fallback)` | `SecretsManagerProvider` | `JSON.parse`d, **sensitive** |
| `envString(name, fallback)` | `EnvProvider` | non-empty string from `process.env` (sets `alias == name`) |
| `localString(name, fallback)` | `LocalProvider` | non-empty string from the in-memory `localParameters` object |
| `localNonNegativeInt(name, fallback)` | `LocalProvider` | `Number(v)`, must be a non-negative integer |

### Providers (`lib/providers/`)

| Provider | Source | Backing call |
| --- | --- | --- |
| `SsmProvider` | `lib/providers/ssm.js` | `@aws-sdk/client-ssm` `GetParameterCommand({ Name, WithDecryption: true })`; returns `Parameter.Value` (decrypted for SecureString); swallows `ParameterNotFound` -> `undefined`. |
| `SecretsManagerProvider` | `lib/providers/secrets-manager.js` | `@aws-sdk/client-secrets-manager` `GetSecretValueCommand({ SecretId })`; returns `SecretString`; swallows `ResourceNotFoundException` -> `undefined`. |
| `LocalProvider` | `lib/providers/local.js` | Reads from an in-memory object (validates the key is a non-empty string). |
| `EnvProvider` | `lib/providers/env.js` | Subclass of `LocalProvider` scoped to `process.env`. |

### AWS resources touched (read-only, caller-supplied)

ace hardcodes **no** literal ARNs or parameter names — it never owns a resource.
The names below are supplied by the consuming app at call time:

- **SSM Parameter Store** — read via `GetParameterCommand`. The `Name` comes from
  `ssmString` / `ssmNonNegativeInt`, optionally indirected through an env-var
  alias. A missing parameter resolves to `undefined`.
- **Secrets Manager** — read via `GetSecretValueCommand`. The `SecretId` comes
  from `secretsManagerString` / `secretsManagerJson`. Values are flagged
  sensitive and redacted in logs. A missing secret resolves to `undefined`.

## Logs and observability

ace deploys nothing, so it has no CloudWatch log group, DLQ, Sentry project, or
Step Functions state of its own. **All of its output appears in the logs of the
host service that imports it.**

- **Normal logs**: ace logs through the [Pino] logger passed in as `log` (or a
  default [@pureskillgg/mlabs-logger] logger). Each parameter resolution emits a
  child-logger line tagged with `paramName`, `paramAlias`, `paramKey`, and
  `paramProvider`. Visibility depends entirely on the host's `LOG_LEVEL` —
  per-parameter detail (including the redacted `[Redacted]` value previews) is at
  `debug`.
- **Error logs**: failures are plain JS exceptions, not AWS-native failure
  channels. Each fetch's `try/catch` logs `log.error({ err }, 'fail')` and then
  rethrows; `getConfig` runs the fetches under `Promise.all`, so any rejection
  (e.g. an SSM/Secrets Manager `AccessDenied` or throttling error, or a
  `ParameterValidationError` / `ParameterParsingError`) rejects the whole
  `getConfig`. Only `ParameterNotFound` (SSM) and `ResourceNotFoundException`
  (Secrets Manager) are swallowed to `undefined`.
- **Where to look**: in the CloudWatch log group of the consuming lambda/service
  (config typically resolves at boot, so look at the start of an invocation), or
  in CI output when a build runs the consumer. There is no ace-specific log group
  to search.

## Basic Usage

Get configuration from AWS SSM Parameter Store and AWS Secrets Manager.

```js
import { ssmString, secretsManagerString, getConfig } from '@pureskillgg/ace'

const parameters = {
  bucketArn: ssmString('/app/bucket_arn'),
  apiKey: secretsManagerString('/app/api_key')
}

const { bucketArn, apiKey } = await getConfig({ parameters })
```

### Advanced Usage

```js
import { SSMClient } from '@aws-sdk/client-ssm'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import cacheManager from 'cache-manager'
import { localString, ssmString, secretsManagerString, getConfig } from '@pureskillgg/ace'

process.env.BUCKET_ARN_SSM_PATH = '/app/bucket_arn'
process.env.API_KEY_SECRET_ID = '/app/api_key'
process.env.API_ORIGIN = 'https://example.com'
process.env.FOO = 'bar'

const parameters = {
  bucketArn: ssmString('BUCKET_ARN'),
  apiKey: secretsManagerString('API_KEY'),
  apiOrigin: envString('API_ORIGIN'),
  name: localString('FOO')
}

const localParameters = {
  bar: 'baz'
}

const cache = cacheManager.caching()

const { bucketId, apiKey, apiOrigin } = await getConfig({
  parameters,
  localParameters,
  aliases: { ...process.env },
  ssmClient: new SSMClient(),
  secretsManagerClient: new SecretsManagerClient(),
  log: createLogger(),
  cache
})
```

## Installation

Add this as a dependency to your project using [npm] with

```
$ npm install @pureskillgg/makenew-jsmodule
```

[npm]: https://www.npmjs.com/

## Development and Testing

### Quickstart

```
$ git clone https://github.com/pureskillgg/ace.git
$ cd ace
$ nvm install
$ npm install
```

Run the command below in a separate terminal window:

```
$ npm run test:watch
```

Primary development tasks are defined under `scripts` in `package.json`
and available via `npm run`.
View them with

```
$ npm run
```

### Source code

The [source code] is hosted on GitHub.
Clone the project with

```
$ git clone git@github.com:pureskillgg/ace.git
```

[source code]: https://github.com/pureskillgg/ace

### Requirements

You will need [Node.js] with [npm] and a [Node.js debugging] client.

Be sure that all commands run under the correct Node version, e.g.,
if using [nvm], install the correct version with

```
$ nvm install
```

Set the active version for each shell session with

```
$ nvm use
```

Install the development dependencies with

```
$ npm install
```

[Node.js]: https://nodejs.org/
[Node.js debugging]: https://nodejs.org/en/docs/guides/debugging-getting-started/
[npm]: https://www.npmjs.com/
[nvm]: https://github.com/creationix/nvm

### Publishing

Use the [`npm version`][npm-version] command to release a new version.
This will push a new git tag which will trigger a GitHub action.

Publishing may be triggered using on the web
using a [workflow_dispatch on GitHub Actions].

[npm-version]: https://docs.npmjs.com/cli/version
[workflow_dispatch on GitHub Actions]: https://github.com/pureskillgg/ace/actions?query=workflow%3Aversion

## GitHub Actions

_GitHub Actions should already be configured: this section is for reference only._

The following repository secrets must be set on [GitHub Actions]:

- `NPM_TOKEN`: npm token for publishing packages.

These must be set manually.

### Secrets for Optional GitHub Actions

The docs, version, and format GitHub actions
require a user with write access to the repository
including access to read and write packages.
Set these additional secrets to enable the action:

- `GH_USER`: The GitHub user's username.
- `GH_TOKEN`: A personal access token for the user.
- `GIT_USER_NAME`: The GitHub user's real name.
- `GIT_USER_EMAIL`: The GitHub user's email.
- `GPG_PRIVATE_KEY`: The GitHub user's [GPG private key].
- `GPG_PASSPHRASE`: The GitHub user's GPG passphrase.

[GitHub Actions]: https://github.com/features/actions
[GPG private key]: https://github.com/marketplace/actions/import-gpg#prerequisites

## Contributing

Please submit and comment on bug reports and feature requests.

To submit a patch:

1. Fork it (https://github.com/pureskillgg/ace/fork).
2. Create your feature branch (`git checkout -b my-new-feature`).
3. Make changes.
4. Commit your changes (`git commit -am 'Add some feature'`).
5. Push to the branch (`git push origin my-new-feature`).
6. Create a new Pull Request.

## License

This npm package is licensed under the MIT license.

## Warranty

This software is provided by the copyright holders and contributors "as is" and
any express or implied warranties, including, but not limited to, the implied
warranties of merchantability and fitness for a particular purpose are
disclaimed. In no event shall the copyright holder or contributors be liable for
any direct, indirect, incidental, special, exemplary, or consequential damages
(including, but not limited to, procurement of substitute goods or services;
loss of use, data, or profits; or business interruption) however caused and on
any theory of liability, whether in contract, strict liability, or tort
(including negligence or otherwise) arising in any way out of the use of this
software, even if advised of the possibility of such damage.
