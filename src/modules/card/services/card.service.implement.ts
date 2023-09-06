import { CardService } from "./card.service.interface";
import { CARD_REPOSITORY, CardRepository } from "../repositories/card.repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import { CreateCardDto } from "../../dto/create-card.dto";
import { ListCardDto } from "../../dto/list-card.dto";

@Injectable()
export class CardServiceImplement implements CardService {
  constructor(@Inject(CARD_REPOSITORY) private readonly cardRepo: CardRepository) {}

  async findCardById(id: string): Promise<any> {
    return await this.cardRepo.findCardById(id);
  }

  async create(data: CreateCardDto) {
    return await this.cardRepo.create(data);
  }

  async list(data: ListCardDto): Promise<any> {
    return await this.cardRepo.list(data);
  }

  async getCardsInSet(setId: string): Promise<any> {
    return await this.cardRepo.getCardsInSet(setId);
  }
}