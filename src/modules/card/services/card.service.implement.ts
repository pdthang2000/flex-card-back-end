import { CardService } from "./card.service.abstract";
import { CardRepository } from "../repositories/card.repository.abstract";
import { Injectable } from "@nestjs/common";
import { CreateCardDto } from "../../dto/create-card.dto";
import { ListCardDto } from "../../dto/list-card.dto";

@Injectable()
export class CardServiceImplement implements CardService {
  constructor(private readonly cardRepo: CardRepository) {}

  async findCardById(id: string): Promise<any> {
    return await this.cardRepo.findCardById(id);
  }

  async create(data: CreateCardDto) {
    return await this.cardRepo.create(data);
  }

  async list(data: ListCardDto): Promise<any> {
    return await this.cardRepo.list(data);
  }
}