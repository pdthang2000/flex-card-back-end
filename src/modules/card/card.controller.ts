import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CARD_SERVICE, CardService } from './service/card.service.interface';
import { CreateCardDto } from './dto/create-card.dto';
import { ListCardDto } from './dto/list-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('/card')
export class CardController {
  constructor(
    @Inject(CARD_SERVICE) private readonly cardService: CardService,
  ) {}

  @Get('/')
  list(@Query() data: ListCardDto) {
    return this.cardService.list(data);
  }
  @Get(':id')
  get(@Param('id') id: string) {
    return this.cardService.get(id);
  }

  @Post(':id')
  update(@Param('id') id: string, @Body() data: UpdateCardDto) {
    return this.cardService.update(id, data);
  }

  @Post('')
  create(@Body() data: CreateCardDto) {
    return this.cardService.create(data);
  }
}
