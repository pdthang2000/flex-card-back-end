import { Controller, Get, Param } from "@nestjs/common";
import { CardService } from "./services/card.service.abstract";

@Controller('/card')
export class CardController {
  constructor(private readonly cardService: CardService) {
  }
  @Get(':id')
  findCardById(@Param('id') id: string) {
    return this.cardService.findCardById(id);
  }
}