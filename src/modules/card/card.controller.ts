import { Body, Controller, Get, Inject, Param, Post, Query } from "@nestjs/common";
import { CARD_SERVICE, CardService } from "./services/card.service.interface";
import { CreateCardDto } from "../dto/create-card.dto";
import { ListCardDto } from "../dto/list-card.dto";
import { Card } from "@prisma/client";

@Controller('/card')
export class CardController {
  constructor(@Inject(CARD_SERVICE) private readonly cardService: CardService) {
  }

  @Get('/set/:setId')
  async getCardsInSet(@Param('setId') setId: string): Promise<Card[]> {
    return this.cardService.getCardsInSet(setId);
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