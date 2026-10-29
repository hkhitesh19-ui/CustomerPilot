/**
 * Resolves JWT_SECRET at request time.
 * Throws a fatal security exception if missing in production runtime.
 * Never throws at module load time, protecting Next.js static build analysis.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[SECURITY FATAL] JWT_SECRET environment variable is not configured in production runtime!');
    }
    return 'cpilot_jwt_dev_secret_local_only!';
  }
  return secret;
}
