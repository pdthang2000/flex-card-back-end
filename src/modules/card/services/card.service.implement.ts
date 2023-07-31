import { CardService } from "./card.service.abstract";
import { CardRepository } from "../repositories/card.repository.abstract";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CardServiceImplement implements CardService {
  constructor(private readonly cardRepo: CardRepository) {}

  async findCardById(id: string): Promise<any> {
    return await this.cardRepo.findCardById(id);
  }


}