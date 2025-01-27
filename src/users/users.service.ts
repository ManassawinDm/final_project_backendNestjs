import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZEL } from 'src/database/database.module';
import * as schema from '../database/schema/users.schema'
import { AddUsersDto } from 'src/auth/dtos/addUsers.dto';
import * as bcrypt from 'bcrypt';
import { EncodePasswordDto } from 'src/auth/dtos/encodePwd.dto';

@Injectable()
export class UsersService {
    constructor(
        @Inject(DRIZZEL)
        private readonly database: NodePgDatabase<typeof schema>,
    ){}

    async getUsersAll(){
        return this.database.query.users.findMany();
    }

    async EncodePassword(credentials:EncodePasswordDto){
        const { password} = credentials
        const hashPassword = await bcrypt.hash(password, 10); 

        return{ hashPassword, };
    }

    async addUsers(credentials:AddUsersDto){
        const { email , password, firstname, lastname, userClass, department_id, position } = credentials
        const hashPassword = await bcrypt.hash(password, 10); 
    }
}
