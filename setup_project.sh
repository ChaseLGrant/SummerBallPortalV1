#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# setup_project.sh – Bootstrap the Summer Ball Portal project
#
# Usage:
#   ./setup_project.sh
#
# What it does:
#   1. Creates a "summer-ball-portal" directory and copies project files into it
#   2. Installs npm dependencies
#   3. Creates a .env.local from .env.example (prompts for Supabase credentials)
#   4. Initializes a git repository and makes an initial commit
#   5. Optionally pushes to a GitHub remote
#   6. Optionally deploys to Vercel with the required environment variables
###############################################################################

PROJ_DIR="summer-ball-portal"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Colours / helpers ────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Colour

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Pre-flight checks ───────────────────────────────────────────────────────
command -v node >/dev/null 2>&1 || error "Node.js is not installed. Please install it first."
command -v npm  >/dev/null 2>&1 || error "npm is not installed. Please install it first."
command -v git  >/dev/null 2>&1 || error "git is not installed. Please install it first."
command -v rsync >/dev/null 2>&1 || error "rsync is not installed. Please install it first."

# ── 1. Create project directory ─────────────────────────────────────────────
if [ -d "$PROJ_DIR" ]; then
  error "Directory '$PROJ_DIR' already exists. Remove it or choose another location."
fi

info "Creating project directory: $PROJ_DIR"
mkdir -p "$PROJ_DIR"

# Copy project files (exclude .git, node_modules, .next, and the script itself)
info "Copying project files…"
rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='setup_project.sh' \
  --exclude="$PROJ_DIR" \
  "$SCRIPT_DIR/" "$PROJ_DIR/"

cd "$PROJ_DIR"

# ── 2. Install dependencies ─────────────────────────────────────────────────
info "Installing npm dependencies…"
npm install

# ── 3. Configure environment variables ───────────────────────────────────────
info "Setting up environment variables…"

echo ""
read -rp "Enter your NEXT_PUBLIC_SUPABASE_URL: " SUPABASE_URL
read -rp "Enter your NEXT_PUBLIC_SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY

if [ -f .env.local ]; then
  warn ".env.local already exists — overwriting with new values."
fi

cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
EOF

info ".env.local created."

# ── 4. Initialize git ───────────────────────────────────────────────────────
info "Initializing git repository…"
git init
git add .
git commit -m "Initial commit – Summer Ball Portal"

# ── 5. Push to GitHub (optional) ────────────────────────────────────────────
echo ""
read -rp "Push to a GitHub remote? (y/N): " PUSH_ANSWER
if [[ "${PUSH_ANSWER,,}" == "y" ]]; then
  read -rp "Enter the GitHub repository URL (e.g. https://github.com/user/repo.git): " REPO_URL
  git remote add origin "$REPO_URL"
  git branch -M main
  git push -u origin main
  info "Pushed to GitHub."
else
  info "Skipping GitHub push."
fi

# ── 6. Deploy to Vercel (optional) ──────────────────────────────────────────
echo ""
read -rp "Deploy to Vercel now? (y/N): " DEPLOY_ANSWER
if [[ "${DEPLOY_ANSWER,,}" == "y" ]]; then
  if ! command -v vercel >/dev/null 2>&1; then
    warn "Vercel CLI not found. Installing globally…"
    npm install -g vercel
  fi

  info "Deploying to Vercel with environment variables…"
  vercel link

  # Set the required environment variables in Vercel
  printf '%s' "$SUPABASE_URL"      | vercel env add NEXT_PUBLIC_SUPABASE_URL production
  printf '%s' "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

  vercel --prod
  info "Deployed to Vercel."
else
  info "Skipping Vercel deployment."
  echo ""
  info "To deploy later, run:"
  echo "  cd $PROJ_DIR"
  echo "  npx vercel link"
  echo "  npx vercel env add NEXT_PUBLIC_SUPABASE_URL production      # paste your Supabase URL when prompted"
  echo "  npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production  # paste your anon key when prompted"
  echo "  npx vercel --prod"
fi

echo ""
info "Setup complete! 🎉"
info "Run 'cd $PROJ_DIR && npm run dev' to start the development server."
