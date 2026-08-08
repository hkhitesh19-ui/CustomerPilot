export const APP_VERSION = "RC-3.0"
export const RELEASE_NAME = "RC-3 SRE Operational Pilot"
export const BUILD_DATE = "2026-08-07T17:00:00.000Z"
export const ENVIRONMENT = process.env.NODE_ENV || "production"
export const GIT_COMMIT_STAMP = "rc3-operational-pilot-commit-01"

export function getSystemVersionInfo() {
  return {
    version: APP_VERSION,
    releaseName: RELEASE_NAME,
    buildDate: BUILD_DATE,
    environment: ENVIRONMENT,
    commitStamp: GIT_COMMIT_STAMP,
  }
}
