# Deploy to Replit

## Steps to Deploy:

1. **Go to Replit**: [https://replit.com](https://replit.com)

2. **Create New Repl**:
   - Click "Create Repl"
   - Select "Import from GitHub"
   - Paste your GitHub repository URL
   - Click "Import from GitHub"

3. **Wait for Setup**:
   - Replit will automatically detect the Node.js project
   - It will read the `.replit` and `replit.nix` files
   - Dependencies will be installed automatically

4. **Run the Project**:
   - Click the "Run" button at the top
   - The server will start on port 3000
   - Replit will provide a public URL (e.g., `https://your-repl-name.your-username.repl.co`)

5. **Get Your URL**:
   - Once running, copy the URL from the webview panel
   - This is the URL you'll submit to freeCodeCamp

6. **Submit to freeCodeCamp**:
   - Go to the freeCodeCamp challenge page
   - Paste your Replit URL in the solution link field
   - Click "I've completed this challenge"

## Troubleshooting:

- If the server doesn't start, check the Console tab for errors
- Make sure all dependencies installed correctly
- The `.replit` file should have `run = "npm start"`
- Port 3000 is configured in the `.env` file

## Testing Your Deployment:

Once deployed, test these URLs:
- Main game: `https://your-repl-url/`
- Should see the game canvas and be able to play

All security headers are configured and tests should pass!
