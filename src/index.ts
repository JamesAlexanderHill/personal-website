export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContactForm(request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function handleContactForm(
  request: Request,
  env: Env
): Promise<Response> {
  let data: ContactFormData;

  try {
    data = (await request.json()) as ContactFormData;
  } catch {
    return Response.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    );
  }

  const ip = request.headers.get("CF-Connecting-IP") || "";

  // Always verify turnstile to get the score
  const turnstileOutcome = await verifyTurnstileToken(
    data.token,
    ip,
    env.TURNSTILE_SECRET_KEY
  );

  // Always log to Google Sheets, regardless of turnstile result
  let sheetsDebug: Record<string, unknown> = {};
  try {
    const accessToken = await getGoogleAccessToken(
      env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      env.GOOGLE_PRIVATE_KEY
    );

    const sheetResponse = await appendToGoogleSheet({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      accessToken,
      values: [
        new Date().toISOString(),
        data.name,
        data.email,
        data.message,
        turnstileOutcome.success ? "PASSED" : "FAILED",
        String(turnstileOutcome.score ?? ""),
      ],
    });

    if (!sheetResponse.ok) {
      const errorBody = await sheetResponse.text();
      sheetsDebug = {
        sheetsStatus: sheetResponse.status,
        sheetsError: errorBody,
        spreadsheetIdDefined: !!env.GOOGLE_SPREADSHEET_ID,
        serviceAccountDefined: !!env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        privateKeyDefined: !!env.GOOGLE_PRIVATE_KEY,
      };
    } else {
      sheetsDebug = { sheetsStatus: sheetResponse.status };
    }
  } catch (error) {
    sheetsDebug = {
      sheetsError: error instanceof Error ? error.message : String(error),
      spreadsheetIdDefined: !!env.GOOGLE_SPREADSHEET_ID,
      serviceAccountDefined: !!env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKeyDefined: !!env.GOOGLE_PRIVATE_KEY,
    };
  }

  // Only send email if turnstile passed
  if (!turnstileOutcome.success) {
    const secret = env.TURNSTILE_SECRET_KEY;
    return Response.json(
      {
        success: false,
        message:
          "Verification failed. If you believe this is an error, please try again.",
        turnstile: turnstileOutcome,
        debug: {
          secretDefined: secret !== undefined && secret !== null,
          secretLength: secret?.length ?? 0,
          secretPrefix: secret?.substring(0, 4) ?? "N/A",
        },
      },
      { status: 400 }
    );
  }

  try {
    const emailResponse = await sendEmail({
      from: env.WEBSITE_EMAIL,
      to: env.RECEIVER_EMAIL,
      replyTo: data.email,
      subject: `[Website enquiry] - ${data.name}`,
      text: `You have a new website enquiry from ${data.name} (${data.email}): message: ${data.message}`,
      html: `<p>You have a new website enquiry from ${data.name}.</p>
        <p>Please find the details below:</p>
        <p>Name: ${data.name}</p>
        <p>Email: ${data.email}</p>
        <p>Message: ${data.message}</p>`,
      mgDomain: env.MAILGUN_DOMAIN,
      mgApiKey: env.MAILGUN_API_KEY,
    });

    if (!emailResponse.ok) {
      const errorBody = await emailResponse.text();
      return Response.json(
        {
          success: false,
          message:
            "There was an error sending your message. Please try again later or reach out via an alternative method.",
          debug: {
            mailgunStatus: emailResponse.status,
            mailgunError: errorBody,
            mgDomainDefined: !!env.MAILGUN_DOMAIN,
            mgApiKeyDefined: !!env.MAILGUN_API_KEY,
            websiteEmailDefined: !!env.WEBSITE_EMAIL,
            receiverEmailDefined: !!env.RECEIVER_EMAIL,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message:
          "There was an error sending your message. Please try again later or reach out via an alternative method.",
        debug: {
          error: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }

  return Response.json({
    success: true,
    message:
      "Thanks for reaching out! We will get in contact with you as soon as possible.",
    debug: { sheets: sheetsDebug },
  });
}

// --- Turnstile ---

interface TurnstileOutcome {
  success: boolean;
  score?: number;
  "error-codes"?: string[];
}

async function verifyTurnstileToken(
  token: string,
  ip: string,
  secret: string
): Promise<TurnstileOutcome> {
  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  formData.append("remoteip", ip);

  const result = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    }
  );

  return await result.json();
}

// --- Mailgun ---

interface EmailParams {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
  mgDomain: string;
  mgApiKey: string;
}

async function sendEmail({
  from,
  to,
  replyTo,
  subject,
  html,
  text,
  mgDomain,
  mgApiKey,
}: EmailParams): Promise<Response> {
  const body = new URLSearchParams();
  body.append("from", from);
  body.append("to", to);
  body.append("h:Reply-To", replyTo);
  body.append("subject", subject);
  body.append("text", text);
  body.append("html", html);

  return await fetch(`https://api.mailgun.net/v3/${mgDomain}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`api:${mgApiKey}`)}`,
    },
    body: body.toString(),
  });
}

// --- Google Sheets ---

async function getGoogleAccessToken(
  serviceAccountEmail: string,
  privateKeyPem: string
): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: serviceAccountEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const encodedHeader = encode(header);
  const encodedClaimSet = encode(claimSet);
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

  const pemContents = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = btoa(
    String.fromCharCode(...new Uint8Array(signature))
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${signatureInput}.${encodedSignature}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = (await tokenResponse.json()) as { access_token: string };
  return tokenData.access_token;
}

interface AppendToSheetParams {
  spreadsheetId: string;
  accessToken: string;
  values: string[];
}

async function appendToGoogleSheet({
  spreadsheetId,
  accessToken,
  values,
}: AppendToSheetParams): Promise<Response> {
  const range = "Sheet1!A:F";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  return await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [values] }),
  });
}

// --- Type definitions ---

interface Env {
  ASSETS: Fetcher;
  TURNSTILE_SECRET_KEY: string;
  RECEIVER_EMAIL: string;
  WEBSITE_EMAIL: string;
  MAILGUN_DOMAIN: string;
  MAILGUN_API_KEY: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  GOOGLE_SPREADSHEET_ID: string;
}

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  token: string;
}
