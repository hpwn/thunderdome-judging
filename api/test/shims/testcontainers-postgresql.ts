export class StartedPostgreSqlContainer {
  getConnectionUri(): string { return 'postgresql://dev:devpw@localhost:5432/test'; }
  async stop() {}
}

export class PostgreSqlContainer {
  withDatabase(_name: string) { return this; }
  withUsername(_u: string) { return this; }
  withPassword(_p: string) { return this; }
  async start(): Promise<StartedPostgreSqlContainer> { return new StartedPostgreSqlContainer(); }
}
