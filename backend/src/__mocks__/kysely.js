class Kysely {
  constructor(config) {
    this.config = config;
  }
}

class PostgresDialect {
  constructor(config) {
    this.config = config;
  }
}

module.exports = {
  Kysely,
  PostgresDialect
};
