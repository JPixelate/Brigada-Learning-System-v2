# ──────────────────────────────────────────────────────
# Dockerfile — Express Backend Server
# ──────────────────────────────────────────────────────

FROM node:20-alpine

# Set working root so that '../supabase_schema.sql' resolves correctly
# (server/server.js references path.resolve(__dirname, '../supabase_schema.sql'))
WORKDIR /app

# Copy the schema file used by the DB init endpoint
COPY supabase_schema.sql ./

# Move into the server subfolder
WORKDIR /app/server

# Install production dependencies only
COPY server/package*.json ./
RUN npm install --omit=dev

# Copy the rest of the server source
COPY server/ .

EXPOSE 5000

CMD ["node", "server.js"]
