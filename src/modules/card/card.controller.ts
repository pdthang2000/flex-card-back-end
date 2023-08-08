import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CardService } from "./services/card.service.abstract";
import { CreateCardDto } from "../dto/create-card.dto";
import { ListCardDto } from "../dto/list-card.dto";

@Controller('/card')
export class CardController {
  constructor(private readonly cardService: CardService) {
  }

  @Get('/')
  listCard(@Query() data: ListCardDto) {
    return this.cardService.list(data);
  }
  @Get(':id')
  findCardById(@Param('id') id: string) {
    return this.cardService.findCardById(id);
  }

  @Post('')
  create(@Body() data: CreateCardDto) {
    return this.cardService.create(data);
  }
}