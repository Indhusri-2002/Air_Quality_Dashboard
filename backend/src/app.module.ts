import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from './weather/weather.module';
import { ConfigService } from './config/config.service';
import { ScheduleModule } from '@nestjs/schedule';

const configService = ConfigService.getInstance();
const mongoURI = configService.get('MONGO_URI');

@Module({
  imports: [
    MongooseModule.forRoot(mongoURI),
    ScheduleModule.forRoot(),
    WeatherModule
  ],
})
export class AppModule {}
