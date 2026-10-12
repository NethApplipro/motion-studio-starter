# Image de rendu du studio (Hetzner, Coolify, CI) : mêmes polices, même navigateur, même ffmpeg partout.
#   docker build -t motion-studio .
#   docker run --rm -v "$PWD/out:/app/out" -v "$PWD/reviews:/app/reviews" motion-studio npm run render -- Demo
#   docker run --rm -v "$PWD/out:/app/out" -v "$PWD/reviews:/app/reviews" motion-studio npm run qa -- Demo
FROM node:22-bookworm-slim
# Dépendances du Chrome headless de Remotion (https://www.remotion.dev/docs/miscellaneous/linux-dependencies) + ffmpeg complet.
RUN apt-get update && apt-get install -y --no-install-recommends \
	ffmpeg ca-certificates libnss3 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 libgbm1 libasound2 libxrandr2 \
	libxkbcommon0 libxfixes3 libxcomposite1 libxdamage1 libpango-1.0-0 libcairo2 libcups2 libdrm2 \
	&& rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Navigateur headless téléchargé à la construction (aucun téléchargement au rendu), puis sons de synthèse.
RUN npx remotion browser ensure && node scripts/sfx.mjs
CMD ["npm", "run", "check"]
