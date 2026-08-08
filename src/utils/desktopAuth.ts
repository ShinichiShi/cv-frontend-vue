import { open } from "@tauri-apps/plugin-shell";
import { fetch } from "@tauri-apps/plugin-http";
import { generateCodeChallenge, generateCodeVerifier, generateState } from "#/utils/pkce";

const REDIRECT_URI = "circuitverse://auth";
const OAUTH_SCOPE = "public profile email";

function circuitVerseOrigin(): string {
  return import.meta.env.VITE_CIRCUITVERSE_ORIGIN || "https://circuitverse.org";
}

function clientId(): string {
  return import.meta.env.VITE_TAURI_OAUTH_CLIENT_ID || "";
}

let pendingCodeVerifier: string | null = null;
let pendingState: string | null = null;

export async function startDesktopSignIn(): Promise<void> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  pendingCodeVerifier = codeVerifier;
  pendingState = state;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId(),
    redirect_uri: REDIRECT_URI,
    scope: OAUTH_SCOPE,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
  });

  const authorizeUrl = `${circuitVerseOrigin()}/oauth/authorize?${params.toString()}`;
  console.log("[desktopAuth] starting sign-in, opening system browser at", authorizeUrl);
  await open(authorizeUrl);
  console.log("[desktopAuth] browser opened, waiting for cv-auth-complete deep-link event");
}

export interface AuthCompletePayload {
  code?: string | null;
  state?: string | null;
}

export async function completeDesktopSignIn(payload: AuthCompletePayload): Promise<string | null> {
  console.log("[desktopAuth] cv-auth-complete received, code_present=%s state_present=%s", !!payload.code, !!payload.state)

  const codeVerifier = pendingCodeVerifier;
  const expectedState = pendingState;
  pendingCodeVerifier = null;
  pendingState = null;

  if (!payload.code || !payload.state || !codeVerifier || !expectedState) {
    console.error("[desktopAuth] Missing code/state or no sign-in in progress (pending state was", !!expectedState, ")");
    return null;
  }

  if (payload.state !== expectedState) {
    console.error("[desktopAuth] State mismatch - possible CSRF, aborting");
    return null;
  }

  console.log("[desktopAuth] state verified, exchanging code at", `${circuitVerseOrigin()}/oauth/token`);

  try {
    const response = await fetch(`${circuitVerseOrigin()}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: payload.code,
        redirect_uri: REDIRECT_URI,
        client_id: clientId(),
        code_verifier: codeVerifier,
      }),
    });

    console.log("[desktopAuth] token endpoint responded with status", response.status);

    if (!response.ok) {
      console.error("[desktopAuth] Token exchange failed:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    console.log("[desktopAuth] token exchange succeeded, access_token present=%s", !!data.access_token);
    return data.access_token ?? null;
  } catch (err) {
    console.error("[desktopAuth] Token exchange error:", err);
    return null;
  }
}
