# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in CatTags, please do **NOT** open a public issue.

Instead, report vulnerabilities privately by emailing:  
`security@cattags.xyz` or contacting **ItzCat** directly on GitHub.

## Security Model & Assumed Environment

1. **Client Isolation**: The Minecraft Fabric mod is distributed publicly and can be decompiled. It contains **zero** administrative secrets, database passwords, or privileged keys.
2. **Offline Mode & Identity Spoofing**: Because offline/cracked servers do not use Mojang session servers, player identities are verified via temporary cryptographic tokens (`/team verify <code>`) rather than blindly trusting username headers.
3. **Backend Hardening**:
   - Password storage uses bcrypt with salt rounds.
   - All input queries use parameterized SQL to prevent SQL injection.
   - CORS, Helmet HTTP headers, and IP rate limiting are active on all public endpoints.
   - Uploaded logos are strictly limited to PNG/WebP files under 512KB.
