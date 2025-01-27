import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema/schema'
import { Pool } from 'pg';


export const DRIZZEL = Symbol('drizzel-connection');
@Module({
  providers: [
    {
      provide: DRIZZEL,
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          connectionString: configService.getOrThrow('DATABASE_URL'),
        });
        return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
      },
      inject: [ConfigService],
    },
  ],
  exports: [DRIZZEL]
})
export class DatabaseModule {}