import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_TTL: z.string().default('24h'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  ALLOWED_ISSUERS: z
    .string()
    .default('https://host.docker.internal')
    .transform((s) =>
      s.split(',').map((i) => i.trim()).filter(Boolean),
    ),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid env:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export const config = {
  ...env,
  corsOrigins: env.CORS_ORIGINS.split(',').map((s) => s.trim()),
  isProd: env.NODE_ENV === 'production',
};
