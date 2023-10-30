import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { SET_SERVICE, SetService } from './service/set.service.interface';
import { ListSetDto } from './dto/list-set.dto';

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
}
