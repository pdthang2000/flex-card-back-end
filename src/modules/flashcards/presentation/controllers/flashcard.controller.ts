import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { FlashcardService } from '../../application/services/flashcard.service';
import { CreateFlashcardDto } from '../../application/dto/create-flashcard.dto';
import { ListFlashcardsDto } from '../../application/dto/list-flashcards.dto';
import { UpdateFlashcardDto } from '../../application/dto/update-flashcard.dto';

@Controller('flashcard')
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @Get()
  list(@Request() req: any, @Query() queries: ListFlashcardsDto) {
    const userId = req?.user?.id ?? '8d9c3fb0-4e97-4857-94f5-eb3e9e4b17eb';
    return this.flashcardService.list(userId, {
      page: queries.page,
      size: queries.size,
      tagNames: queries.tagNames ?? [],
      mode: queries.mode ?? 'all',
      sort: queries.sort ?? 'link',
    });
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreateFlashcardDto) {
    // req.user.id is typically set by your auth guard/middleware
    // const userId = req.user?.id;
    const userId = '8d9c3fb0-4e97-4857-94f5-eb3e9e4b17eb';
    return this.flashcardService.create(userId, dto);
  }

  @Post(':id/tags/:tagId')
  assignTag(
    @Request() req: any,
    @Param('id') id: string,
    @Param('tagId') tagId: string,
  ) {
    const userId = '8d9c3fb0-4e97-4857-94f5-eb3e9e4b17eb';
    return this.flashcardService.assignTag(req?.user?.id ?? userId, id, tagId);
  }

  @Delete(':id/tags/:tagId')
  removeTag(
    @Request() req: any,
    @Param('id') id: string,
    @Param('tagId') tagId: string,
  ) {
    const userId = '8d9c3fb0-4e97-4857-94f5-eb3e9e4b17eb';
    return this.flashcardService.removeTag(req?.user?.id ?? userId, id, tagId);
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
    @Body() body: UpdateFlashcardDto,
  ) {
    const userId = req?.user?.id ?? '8d9c3fb0-4e97-4857-94f5-eb3e9e4b17eb';
    return this.flashcardService.edit(userId, id, body);
  }

  @Delete(':id')
  async softDelete(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    await this.flashcardService.softDelete(userId, id);
    return { success: true };
  }
}
