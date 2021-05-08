# AWS Config Executor

[![GitHub Actions](https://github.com/pureskillgg/ace/workflows/main/badge.svg)](https://github.com/pureskillgg/ace/actions)

Loads and caches configuration and secrets from AWS services.

## Description

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
[cache-manager]: https://github.com/BryanDonovan/node-cache-manager

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

const parameters = {
  bucketArn: ssmString('BUCKET_ARN'),
  apiKey: secretsManagerString('API_KEY'),
  apiOrigin: localString('API_ORIGIN')
}

const localParameters = {
  API_ORIGIN: 'https://example.com'
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
$ npm install @pureskillgg/ace
```

or using [Yarn] with

```
$ yarn add @pureskillgg/ace
```

[npm]: https://www.npmjs.com/
[Yarn]: https://yarnpkg.com/

## Development and Testing

### Quickstart

```
$ git clone https://github.com/pureskillgg/ace.git
$ cd ace
$ nvm install
$ yarn install
```

Run the command below in a separate terminal window:

```
$ yarn run test:watch
```

Primary development tasks are defined under `scripts` in `package.json`
and available via `yarn run`.
View them with

```
$ yarn run
```

### Source code

The [source code] is hosted on GitHub.
Clone the project with

```
$ git clone git@github.com:pureskillgg/ace.git
```

[source code]: https://github.com/pureskillgg/ace

### Requirements

You will need [Node.js] with [npm], [Yarn], and a [Node.js debugging] client.

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
$ yarn install
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

- `GH_TOKEN`: A personal access token to read and write packages.

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

This npm package is Copyright (c) 2019-2021 FPS Critic, Inc.

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
