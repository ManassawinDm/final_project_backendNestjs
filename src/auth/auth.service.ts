import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DRIZZEL } from 'src/database/database.module';
import * as schema from '../database/schema/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { LoginDto } from './dtos/login.dto';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZEL)
    private readonly database: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async login(credentials: LoginDto) {
    const { email, password } = credentials;
    const users = await this.database
      .select()
      .from(schema.authUsers)
      .where(eq(schema.authUsers.email, email))
      .limit(1)
      .execute();
    if (users.length === 0) {
      throw new UnauthorizedException('User not found!!');
    }
    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    const accessTokens = await this.generateUserTokens(
      user.userId,
      user.email,
      user.role,
    );
    const refreshTokens = await this.generateRefreshTokens();
    const updateRefreshToken = await this.updateRefreshTokens(
      user.userId,
      refreshTokens,
    );

    return {
      accessTokens,
      refreshTokens,
    };
  }

  async generateUserTokens(userId: any, username: string, role: string) {
    const accessTokens = this.jwtService.sign(
      { userId, username, role },
      { expiresIn: '1m' },
    );
    return accessTokens;
  }

  async generateRefreshTokens() {
    const refreshTokens = uuidv4();
    return refreshTokens;
  }

  async updateRefreshTokens(userId: any, refreshToken: string) {
    const token = await this.database
      .select()
      .from(schema.refreshToken)
      .where(eq(schema.refreshToken.userId, userId))
      .execute();

    if (token.length === 0) {
      await this.database
        .insert(schema.refreshToken)
        .values({ userId, refreshToken })
        .execute();
    } else {
      await this.database
        .update(schema.refreshToken)
        .set({ refreshToken: refreshToken })
        .where(eq(schema.refreshToken.userId, userId))
        .execute();
    }
  }






}
