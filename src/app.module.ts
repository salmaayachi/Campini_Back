import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CampingModule } from './campings/camping/camping.module';
import { UserModule } from './users/user/user.module';
import { AuthModule } from './users/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'nest-mysql',
      port: 3306,
      username: 'root',
      password: 'pass',
      database: 'campini',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    CampingModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
