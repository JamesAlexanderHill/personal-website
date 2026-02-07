async function verifyTurnstileToken(token, ip, secret) {
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        body: JSON.stringify({
            secret,
            response: token,
            remoteip: ip,
        }),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return await result.json();
}

async function sendEmailFromWebsite({ from, to, replyTo, subject, html, text, mgDomain, mgApiKey }) {
    const body = new URLSearchParams();
    body.append('from', from);
    body.append('to', to);
    body.append('h:Reply-To', replyTo);
    body.append('subject', subject);
    body.append('text', text);
    body.append('html', html);

    return await fetch(`https://api.mailgun.net/v3/${mgDomain}/messages`, {
        method: 'POST',
        body: body.toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${btoa(`api:${mgApiKey}`)}`,
        },
    });
}

async function getGoogleAccessToken(serviceAccountEmail, privateKeyPem) {
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const claimSet = {
        iss: serviceAccountEmail,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
    };

    const encode = (obj) =>
        btoa(JSON.stringify(obj))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

    const encodedHeader = encode(header);
    const encodedClaimSet = encode(claimSet);
    const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

    // Import the PEM private key
    const pemContents = privateKeyPem
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s/g, '');

    const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        binaryKey.buffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        new TextEncoder().encode(signatureInput)
    );

    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const jwt = `${signatureInput}.${encodedSignature}`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    });

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
}

async function appendToGoogleSheet({ spreadsheetId, accessToken, values }) {
    const range = 'Sheet1!A:D';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            values: [values],
        }),
    });

    return response;
}

/**
 * POST /api/contact
 *
 * Environment variables required:
 * - TURNSTILE_SECRET_KEY: Cloudflare Turnstile secret key
 * - RECEIVER_EMAIL: Email address to receive contact form submissions
 * - WEBSITE_EMAIL: Email address used as the "from" address
 * - MAILGUN_DOMAIN: Mailgun domain
 * - MAILGUN_API_KEY: Mailgun API key
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Google service account email
 * - GOOGLE_PRIVATE_KEY: Google service account private key (PEM format)
 * - GOOGLE_SPREADSHEET_ID: Google Sheets spreadsheet ID
 */
export async function onRequestPost(context) {
    const data = await context.request.json();

    const ip = context.request.headers.get('CF-Connecting-IP');
    const receiverEmail = context.env.RECEIVER_EMAIL;
    const websiteEmail = context.env.WEBSITE_EMAIL;
    const mgDomain = context.env.MAILGUN_DOMAIN;
    const mgApiKey = context.env.MAILGUN_API_KEY;
    const turnstileSecretKey = context.env.TURNSTILE_SECRET_KEY;
    const googleServiceAccountEmail = context.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const googlePrivateKey = context.env.GOOGLE_PRIVATE_KEY;
    const googleSpreadsheetId = context.env.GOOGLE_SPREADSHEET_ID;

    return await verifyTurnstileToken(data.token, ip, turnstileSecretKey)
        .then((outcome) => {
            if (!outcome.success) {
                throw new Error('Turnstile validation failed');
            }
        })
        .then(() =>
            sendEmailFromWebsite({
                from: websiteEmail,
                to: receiverEmail,
                replyTo: data.email,
                subject: `[Website enquiry] - ${data.name}`,
                text: `You have a new website enquiry from ${data.name} (${data.email}): message: ${data.message}`,
                html: `<p>You have a new website enquiry from ${data.name}.</p>
                <p>Please find the details below:</p>
                <p>Name: ${data.name}</p>
                <p>Email: ${data.email}</p>
                <p>Message: ${data.message}</p>`,
                mgDomain,
                mgApiKey,
            })
        )
        .then((response) => {
            if (!response.ok) {
                throw new Error('Mailgun API error');
            }
        })
        .then(async () => {
            const accessToken = await getGoogleAccessToken(googleServiceAccountEmail, googlePrivateKey);
            const timestamp = new Date().toISOString();
            const sheetResponse = await appendToGoogleSheet({
                spreadsheetId: googleSpreadsheetId,
                accessToken,
                values: [timestamp, data.name, data.email, data.message],
            });

            if (!sheetResponse.ok) {
                console.error('Google Sheets API error:', await sheetResponse.text());
            }
        })
        .then(() =>
            Response.json({
                success: true,
                message: 'Thanks for reaching out, we will get in contact with you as soon as possible',
            })
        )
        .catch((error) => {
            console.error(error);

            return Response.json(
                {
                    success: false,
                    message: 'There was an error saving your contact details, please reach out to us via an alternative method',
                },
                { status: 400 }
            );
        });
}
