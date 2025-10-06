import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ValidateObjectIdMongodb implements PipeTransform<string, string> {
  transform(value: string) {
    try {
      new ObjectId(value);
      return value;
    } catch (error) {
      throw new BadRequestException('Invalid ObjectId.');
    }
  }
}
