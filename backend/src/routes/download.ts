import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

const GITHUB_REPO = process.env.GITHUB_REPO || 'itz0cat/cattags';
const GITHUB_LATEST_RELEASE_URL = `https://github.com/${GITHUB_REPO}/releases/latest/download/cattags.jar`;
const GITHUB_LATEST_SOURCES_URL = `https://github.com/${GITHUB_REPO}/releases/latest/download/cattags-1.0.0-sources.jar`;

// Fallback version metadata if GitHub API is offline or rate-limited
const STATIC_FALLBACK_VERSIONS = [
  {
    version: '1.0.0',
    tagName: 'v1.0.0',
    name: 'CatTags v1.0.0 - Fabric 1.21.11',
    minecraft: '1.21.11',
    loader: 'Fabric',
    javaVersion: '21+',
    releaseDate: '2026-09-07T11:31:00Z',
    downloadUrl: GITHUB_LATEST_RELEASE_URL,
    directFileUrl: `https://github.com/${GITHUB_REPO}/releases/download/v1.0.0/cattags-1.0.0.jar`,
    sourcesUrl: GITHUB_LATEST_SOURCES_URL,
    sizeBytes: 48781,
    sizeHuman: '47.6 KB',
    changelog: 'Initial official release for Minecraft 1.21.11 Fabric. Features gradient nametags, tab list formatting, in-game verification codes, logo icons, offline caching, and ModMenu configuration.'
  }
];

let cachedVersions: any = null;
let cacheExpiresAt = 0;

/**
 * Fetch GitHub releases with in-memory caching to avoid rate limits
 */
async function getReleases() {
  const now = Date.now();
  if (cachedVersions && now < cacheExpiresAt) {
    return cachedVersions;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CatTags-Backend/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Fallback to static if rate limited
      return STATIC_FALLBACK_VERSIONS;
    }

    const data: any = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return STATIC_FALLBACK_VERSIONS;
    }

    const versions = data.map((rel: any) => {
      const jarAsset = rel.assets?.find((a: any) => a.name.endsWith('.jar') && !a.name.includes('-sources'));
      const sourcesAsset = rel.assets?.find((a: any) => a.name.includes('-sources.jar'));
      const versionClean = rel.tag_name ? rel.tag_name.replace(/^v/, '') : '1.0.0';

      return {
        version: versionClean,
        tagName: rel.tag_name || `v${versionClean}`,
        name: rel.name || `CatTags ${rel.tag_name}`,
        minecraft: '1.21.11',
        loader: 'Fabric',
        javaVersion: '21+',
        releaseDate: rel.published_at || rel.created_at,
        downloadUrl: jarAsset?.browser_download_url || `https://github.com/${GITHUB_REPO}/releases/download/${rel.tag_name}/cattags.jar`,
        directFileUrl: jarAsset?.browser_download_url || `https://github.com/${GITHUB_REPO}/releases/download/${rel.tag_name}/cattags-${versionClean}.jar`,
        sourcesUrl: sourcesAsset?.browser_download_url || null,
        sizeBytes: jarAsset?.size || 48781,
        sizeHuman: jarAsset?.size ? `${(jarAsset.size / 1024).toFixed(1)} KB` : '47.6 KB',
        changelog: rel.body || 'Performance improvements and bug fixes.'
      };
    });

    cachedVersions = versions;
    cacheExpiresAt = now + 5 * 60 * 1000; // Cache for 5 minutes
    return versions;
  } catch {
    return STATIC_FALLBACK_VERSIONS;
  }
}

/**
 * GET /api/v1/download/latest
 * Persistent download handler:
 * 1. Checks if local file exists if direct=true requested
 * 2. Redirects to permanent GitHub release CDN (resistant to Render restarts and ephemeral disk wipes)
 */
router.get('/latest', (req: Request, res: Response) => {
  const isSources = req.query.type === 'sources';
  const directRequested = req.query.direct === 'true';

  // Check for local file if direct download requested
  if (directRequested) {
    const localJarName = isSources ? 'cattags-1.0.0-sources.jar' : 'cattags-1.0.0.jar';
    const possiblePaths = [
      path.join(process.cwd(), 'mod', 'build', 'libs', localJarName),
      path.join(__dirname, '..', '..', '..', 'mod', 'build', 'libs', localJarName),
      path.join('/sdcard/Download', 'cattags-1.0.0.jar')
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Disposition', `attachment; filename="${localJarName}"`);
        return res.sendFile(filePath);
      }
    }
  }

  // Persistent CDN redirect: Never lost across Render redeploys/restarts
  const targetUrl = isSources ? GITHUB_LATEST_SOURCES_URL : GITHUB_LATEST_RELEASE_URL;
  return res.redirect(302, targetUrl);
});

/**
 * GET /api/v1/download/mod
 * Alias for /api/v1/download/latest
 */
router.get('/mod', (req: Request, res: Response) => {
  res.redirect(302, '/api/v1/download/latest');
});

/**
 * GET /api/v1/download/versions
 * Returns all available mod versions with download links and metadata
 */
router.get('/versions', async (_req: Request, res: Response) => {
  const versions = await getReleases();
  res.setHeader('Cache-Control', 'public, max-age=180'); // 3 minutes client caching
  res.json({
    latest: versions[0] || STATIC_FALLBACK_VERSIONS[0],
    versions,
    requirements: {
      minecraft: '1.21.11',
      loader: 'Fabric',
      java: 'Java 21 or newer',
      recommendedDependencies: [
        { name: 'Fabric API', required: true, url: 'https://modrinth.com/mod/fabric-api' },
        { name: 'Mod Menu', required: false, url: 'https://modrinth.com/mod/modmenu' }
      ]
    }
  });
});

export default router;
