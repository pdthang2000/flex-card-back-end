import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CardController } from "./card.controller";
import { CardService } from "./services/card.service.abstract";
import { CardServiceImplement } from "./services/card.service.implement";
import { CardRepository } from "./repositories/card.repository.abstract";
import { CardRepositoryImplement } from "./repositories/card.repository.implement";

@Module({
  imports: [PrismaModule],
  providers: [
    CardRepositoryImplement,
    { provide: CardRepository, useClass: CardRepositoryImplement },
    { provide: CardService, useClass: CardServiceImplement }
  ],
  controllers: [CardController]
})

export class CardModule {}
