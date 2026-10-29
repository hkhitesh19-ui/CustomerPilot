import { test as base, expect } from '@playwright/test';

export interface AllowedNetworkError {
  urlPath: string; // Exact pathname match
  status: number;  // Exact HTTP status
  reason: string;  // Explicit justification for why this response code is permissible
}

/**
 * STRICT NETWORK ERROR ALLOWLIST
 * Only intentional negative flows or benign browser fallbacks are allowed.
 * Wildcards like '/api/*' or any unmapped 500 errors are STRICTLY FORBIDDEN.
 */
export const STRICT_ALLOWED_NETWORK_ERRORS: AllowedNetworkError[] = [
  {
    urlPath: '/api/auth/me',
    status: 401,
    reason: 'Guest visitors landing on public pages have no session cookie; 401 is expected.'
  },
  {
    urlPath: '/api/auth/logout',
    status: 401,
    reason: 'Explicit unauthenticated logout probe test.'
  },
  {
    urlPath: '/favicon.ico',
    status: 404,
    reason: 'Browser icon fallback probe in local test environments.'
  }
];

/**
 * CONSCIOUS CONSOLE DECISION:
 * We fail STRICTLY on msg.type() === 'error' (unhandled JS exceptions, console.error).
 * Only the benign external React DevTools extension installation tip is filtered.
 * Hydration mismatches and real console errors are STRICTLY TRAPPED.
 */
const BENIGN_CONSOLE_PATTERNS: RegExp[] = [
  // Benign browser extension prompt printed by React in development mode
  /Download the React DevTools/i,
];

/**
 * MULTI-VECTOR TOKEN & SECRET SANITIZATION:
 * Redacts Bearer tokens, raw JWTs, session cookies, query string tokens, API keys, and passwords.
 */
export function sanitizeSensitiveData(text: string): string {
  if (!text) return '';
  return text
    // 1. Bearer authorization headers
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED_BEARER_TOKEN]')
    // 2. Raw 3-segment JWT tokens (header.payload.signature)
    .replace(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, '[REDACTED_JWT]')
    // 3. HTTP Cookie headers & cookie strings (e.g. Cookie: session_token=..., auth_token=...)
    .replace(/(cookie:\s*|set-cookie:\s*)([a-zA-Z0-9_-]*(?:token|jwt|session|auth|sid)[a-zA-Z0-9_-]*)=([^;\s&]+)/gi, '$1$2=[REDACTED_COOKIE]')
    .replace(/\b(session_token|auth_token|remember_token|next-auth\.session-token|connect\.sid)=([^;\s&]+)/gi, '$1=[REDACTED_COOKIE]')
    // 4. Query-string tokens (?token=..., &token=..., &api_key=..., &key=...)
    .replace(/([?&](?:access_token|refresh_token|api[_-]?key|key|auth_token|signature|secret|token))=([^&\s]+)/gi, '$1=[REDACTED_QUERY_PARAM]')
    // 5. API keys, secrets, passwords, client secrets in JSON or text
    .replace(/("(?:api[_-]?key|secret|password|client_secret|private_key)"\s*:\s*)"([^"]+)"/gi, '$1"[REDACTED_SECRET]"')
    .replace(/((?:api[_-]?key|secret|password|client_secret)=)([^\s&"']+)/gi, '$1[REDACTED_SECRET]');
}

/**
 * STRICT EXACT ORIGIN AUDIT:
 * Ensures only exact first-party internal origins match allowlists.
 * Zero wildcard hostnames, zero dynamic ports.
 */
const ALLOWED_INTERNAL_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://customerpilot.in',
  'https://www.customerpilot.in'
]);

export function isAllowedOrigin(url: URL): boolean {
  return ALLOWED_INTERNAL_ORIGINS.has(url.origin);
}

export interface HardenedTestFixtures {
  errorLogs: string[];
}

export const test = base.extend<HardenedTestFixtures>({
  errorLogs: async ({}, use) => {
    const logs: string[] = [];
    await use(logs);
  },

  page: async ({ page, errorLogs }, use) => {
    // 1. Trap Console Errors (Errors only, not warnings)
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        const isBenign = BENIGN_CONSOLE_PATTERNS.some((p) => p.test(text));
        if (isBenign) return;

        // If Chromium logs "Failed to load resource" for an allowlisted internal API, do not double-fail
        if (text.includes('Failed to load resource')) {
          const locationUrl = msg.location()?.url;
          if (locationUrl) {
            try {
              const u = new URL(locationUrl);
              const isAllowlistedResource = isAllowedOrigin(u) && STRICT_ALLOWED_NETWORK_ERRORS.some(
                (rule) => u.pathname === rule.urlPath && (!u.search || u.search === '')
              );
              if (isAllowlistedResource) return;
            } catch {}
          }
        }

        const sanitized = sanitizeSensitiveData(text);
        errorLogs.push(`[Console Error] ${sanitized}`);
      }
    });

    // 2. Trap Unhandled Page Exceptions / Crashes (pageerror)
    page.on('pageerror', (exception) => {
      const sanitized = sanitizeSensitiveData(exception.message || String(exception));
      errorLogs.push(`[Page Crash] ${sanitized}`);
    });

    // 3. Trap Unexpected Network Failures (Status >= 400)
    page.on('response', (response) => {
      const status = response.status();
      if (status >= 400) {
        let url: URL;
        try {
          url = new URL(response.url());
        } catch {
          url = new URL(response.url(), 'http://localhost:3000');
        }

        const requestFullPath = `${url.pathname}${url.search}`;
        // Enforce strict Origin Check: Foreign hostnames with matching paths CANNOT escape the trap
        const isAllowed = isAllowedOrigin(url) && STRICT_ALLOWED_NETWORK_ERRORS.some((rule) => {
          if (rule.urlPath.includes('?')) {
            return requestFullPath === rule.urlPath && status === rule.status;
          }
          // Exact pathname match requiring NO unwhitelisted query parameters
          return url.pathname === rule.urlPath && (!url.search || url.search === '') && status === rule.status;
        });

        if (!isAllowed) {
          const sanitizedOrigin = isAllowedOrigin(url) ? '' : `${url.origin}`;
          const sanitizedPath = sanitizeSensitiveData(`${sanitizedOrigin}${url.pathname}${url.search}`);
          errorLogs.push(`[Network Failure] HTTP ${status} on ${sanitizedPath}`);
        }
      }
    });

    // 4. Trap Aborted / Dropped Network Requests (requestfailed - CORS, DNS, connection drops)
    page.on('requestfailed', (request) => {
      const failure = request.failure();
      const failureText = failure?.errorText || 'Network Request Dropped';
      // Ignore benign cancellations caused by page navigation / unload
      if (failureText.includes('ERR_ABORTED') || failureText.includes('NS_BINDING_ABORTED')) {
        return;
      }
      let urlStr = request.url();
      try {
        const u = new URL(urlStr);
        urlStr = isAllowedOrigin(u) ? `${u.pathname}${u.search}` : `${u.origin}${u.pathname}${u.search}`;
      } catch {}
      const sanitized = sanitizeSensitiveData(urlStr);
      errorLogs.push(`[Request Failed] ${sanitized} — ${failureText}`);
    });

    // Run the test body
    await use(page);

    // Hard Assertion: ZERO unwhitelisted errors permitted
    if (errorLogs.length > 0) {
      throw new Error(
        `\n🚨 Hardened Autonomous QA Trap Caught ${errorLogs.length} Runtime Failure(s):\n` +
          errorLogs.map((e, idx) => `  ${idx + 1}. ${e}`).join('\n') +
          `\n\nResolve the issue in application code or add an explicit justification to the allowlist.`
      );
    }
  },
});

export { expect };
