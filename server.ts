import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'industrial_precision_secret'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true,
    sameSite: 'none',
  }));

  // GitHub OAuth Routes
  app.get('/api/auth/url', (req, res) => {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID || '',
      redirect_uri: `${process.env.APP_URL}/auth/callback`,
      scope: 'repo,user',
      state: Math.random().toString(36).substring(7),
    });
    res.json({ url: `https://github.com/login/oauth/authorize?${params.toString()}` });
  });

  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const { code } = req.query;
    try {
      const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }, {
        headers: { Accept: 'application/json' }
      });

      if (response.data.access_token) {
        req.session!.github_token = response.data.access_token;
        res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
              <p>Authentication successful. This window should close automatically.</p>
            </body>
          </html>
        `);
      } else {
        res.status(400).send('Failed to obtain access token');
      }
    } catch (error) {
      console.error('OAuth Error:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/api/github/user', async (req, res) => {
    const token = req.session!.github_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` }
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.get('/api/github/logout', (req, res) => {
    req.session = null;
    res.json({ success: true });
  });

  // Deploy Route: Creates a repo and pushes files
  app.post('/api/github/deploy', async (req, res) => {
    const token = req.session!.github_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { repoName, files } = req.body; // files: { path: string, content: string }[]

    try {
      // 1. Create Repository
      let repo;
      try {
        const repoResponse = await axios.post('https://api.github.com/user/repos', {
          name: repoName,
          auto_init: true,
          description: 'Deployed via KINETIC_MONOLITH_OS',
        }, {
          headers: { Authorization: `token ${token}` }
        });
        repo = repoResponse.data;
      } catch (e: any) {
        if (e.response?.status === 422) {
          // Repo already exists, fetch it
          const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${token}` }
          });
          const repoResponse = await axios.get(`https://api.github.com/repos/${userResponse.data.login}/${repoName}`, {
            headers: { Authorization: `token ${token}` }
          });
          repo = repoResponse.data;
        } else {
          throw e;
        }
      }

      // 2. Enable GitHub Pages
      try {
        await axios.post(`https://api.github.com/repos/${repo.full_name}/pages`, {
          source: { branch: 'main', path: '/' }
        }, {
          headers: { 
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.switcheroo-preview+json'
          }
        });
      } catch (e) {
        // Might already be enabled or fail if no commits yet
        console.log('Pages enablement skipped or failed');
      }

      // 3. Upload Files (Commit)
      // For simplicity, we'll create a single commit with multiple files using the Git Data API
      // But for a "web deployer", usually we just want to push the files.
      // We'll use the "put content" API for each file for simplicity in this demo.
      for (const file of files) {
        try {
          // Check if file exists to get SHA
          let sha;
          try {
            const existingFile = await axios.get(`https://api.github.com/repos/${repo.full_name}/contents/${file.path}`, {
              headers: { Authorization: `token ${token}` }
            });
            sha = existingFile.data.sha;
          } catch (e) {}

          await axios.put(`https://api.github.com/repos/${repo.full_name}/contents/${file.path}`, {
            message: `Deploy ${file.path} via KINETIC_MONOLITH_OS`,
            content: Buffer.from(file.content).toString('base64'),
            sha
          }, {
            headers: { Authorization: `token ${token}` }
          });
        } catch (e) {
          console.error(`Failed to upload ${file.path}`, e);
        }
      }

      res.json({ 
        success: true, 
        url: `https://${repo.owner.login}.github.io/${repo.name}/`,
        repoUrl: repo.html_url
      });
    } catch (error: any) {
      console.error('Deployment Error:', error.response?.data || error.message);
      res.status(500).json({ error: 'Deployment failed', details: error.response?.data });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
