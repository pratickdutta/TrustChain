// In-memory database for MVP (replace with PostgreSQL in production)
const db = {
  users: new Map(),
  circles: new Map(),
  loans: new Map(),
  attestations: new Map(),
  scores: new Map(),
  nonces: new Map(),
};

module.exports = db;
