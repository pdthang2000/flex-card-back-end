import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { SET_SERVICE, SetService } from './service/set.service.interface';
import { ListSetDto } from './dto/list-set.dto';
import { CreateSetDto } from './dto/create-set.dto';
import { UpdateSetDto } from './dto/update-set.dto';

@Controller('/set')
export class SetController {
  constructor(@Inject(SET_SERVICE) private readonly setService: SetService) {}

  @Get('/')
  list(@Query() data: ListSetDto) {
    return this.setService.list(data);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.setService.get(id);
  }

  @Post('/')
  create(@Body() data: CreateSetDto) {
    return this.setService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateSetDto) {
    return this.setService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.setService.delete(id);
  }
}
