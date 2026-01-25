import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;

    // If no valid database URL, create a mock client for build time
    if (!connectionString || connectionString.includes('your-project.neon.tech')) {
        console.warn('⚠️ Database URL not configured. Database operations will be skipped.');
        // Return a proxy that safely handles database operations
        return new Proxy({} as PrismaClient, {
            get: (_target, prop) => {
                if (prop === 'scan' || prop === 'metric') {
                    return {
                        create: async () => { console.warn('Database not configured'); return null; },
                        findMany: async () => [],
                        findUnique: async () => null,
                    };
                }
                if (prop === '$connect' || prop === '$disconnect') {
                    return async () => { };
                }
                return () => { };
            }
        });
    }

    // Create Neon pool and adapter
    const pool = new Pool({ connectionString });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaNeon(pool as any);
    return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
