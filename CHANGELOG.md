# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

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
