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
import { ValidateObjectIdMongodb } from '../../../../common/pipes/validate-object-id-mongodb';
import { ListFlashcardsDto } from '../../application/dto/list-flashcards.dto';

@Controller('flashcard')
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @Get()
  list(@Request() req: any, @Query() { page, size }: ListFlashcardsDto) {
    // const userId = req.user?.id;
    const userId = '665ed96611f0733b07cc2df6';
    return this.flashcardService.list(req?.user?.id ?? userId, page, size);
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreateFlashcardDto) {
    // req.user.id is typically set by your auth guard/middleware
    // const userId = req.user?.id;
    const userId = '665ed96611f0733b07cc2df6';
    return this.flashcardService.create(userId, dto);
  }

  @Post(':id/tags/:tagId')
  assignTag(
    @Request() req: any,
    @Param('id', ValidateObjectIdMongodb) id: string,
    @Param('tagId', ValidateObjectIdMongodb) tagId: string,
  ) {
    const userId = '665ed96611f0733b07cc2df6';
    return this.flashcardService.assignTag(req?.user?.id ?? userId, id, tagId);
  }

  @Delete(':id/tags/:tagId')
  removeTag(
    @Request() req: any,
    @Param('id', ValidateObjectIdMongodb) id: string,
    @Param('tagId') tagId: string,
  ) {
    const userId = '665ed96611f0733b07cc2df6';
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
    @Param('id', ValidateObjectIdMongodb) id: string,
    @Body() body: { front: string; back: string },
  ) {
    const userId = req.user?.id;
    return this.flashcardService.edit(userId, id, body.front, body.back);
  }

  @Delete(':id')
  async softDelete(
    @Request() req: any,
    @Param('id', ValidateObjectIdMongodb) id: string,
  ) {
    const userId = req.user?.id;
    await this.flashcardService.softDelete(userId, id);
    return { success: true };
  }
}
