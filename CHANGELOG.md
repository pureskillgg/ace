# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## 3.1.2

### Changed

- GitHub Actions updated to Node 24 runtimes: `actions/checkout` v5 to v7; `actions/setup-node` v5 to v6.

## 3.1.1

### Fixed

- `ssmString` now decrypts SecureString parameters (`WithDecryption: true`);
  previously they resolved to the raw KMS ciphertext.

## 3.1.0

### Changed

- Bump internal `@pureskillgg/*` dependencies to their current majors.
- Modernize the development toolchain (ESLint 9 flat config).

## 3.0.1

- Version bump; no code changes.

## 3.0.0

### Changed

- **Breaking:** Require Node.js 22+ — `engines.node` is now `>=22.0.0`,
  dropping support for Node versions below 22.
- Upgrade the development toolchain to Node.js 22: `.nvmrc`, the CI setup
  action default, and the devcontainer now target Node 22. The CI test/lint
  matrix runs on Node 20 and 22 (dropping EOL 14/16).

## 2.0.1 / 2026-06-08

- Version bump; no code changes.

## 2.0.0 / 2026-06-08

### Changed

- Migrate `@meltwater/*` dependencies to their `@pureskillgg/*` re-publications
  (`mlabs-logger`, `phi`, and dev `examplr`).

### Removed

- Drop support for Node.js v12.

## 1.6.0 / 2022-02-25

### Changed

- Update all dependencies.

## 1.5.1 / 2021-12-21

### Fixed

- CI steps.

## 1.5.0 / 2021-12-20

### Changed

- Release under the MIT license.

## 1.4.0 / 2021-10-09

### Added

- `ssmNonNegativeInt` and `localNonNegativeInt`.

## 1.3.1 / 2021-08-30

### Changed

- Update dependencies.

## 1.3.0 / 2021-07-30

### Added

- New factory `secretsManagerJson`.

## 1.2.1 / 2021-05-08

### Fixed

- Incorrect provider for `envString`.

## 1.2.0 / 2021-05-08

### Added

- New provider `EnvProvider` and factory `envString`.

### Fixed

- Handle missing parameter or secret errors.
- Validate after parsing.

## 1.1.0 / 2021-05-05

### Changed

- Fallback to key if alias is missing.

## 1.0.0 / 2021-05-05

- Initial release.
