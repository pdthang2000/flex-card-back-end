import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Request,
} from '@nestjs/common';
import { FlashcardService } from '../../application/services/flashcard.service';
import { CreateFlashcardDto } from '../../application/dto/create-flashcard.dto';

@Controller('flashcard')
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateFlashcardDto) {
    // req.user.id is typically set by your auth guard/middleware
    // const userId = req.user?.id;
    const userId = '665ed96611f0733b07cc2df6';
    return this.flashcardService.create(userId, dto);
  }
  //
  // @Get(':id')
  // async getOne(@Request() req: any, @Param('id') id: string) {
  //   const userId = req.user?.id;
  //   const card = await this.flashcardService.getOne(userId, id);
  //   if (!card) throw new NotFoundException('Flashcard not found');
  //   return card;
  // }

  @Patch(':id')
  async edit(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { front: string; back: string },
  ) {
    const userId = req.user?.id;
    return this.flashcardService.edit(userId, id, body.front, body.back);
  }

  @Delete(':id')
  async softDelete(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    await this.flashcardService.softDelete(userId, id);
    return { success: true };
  }
}
