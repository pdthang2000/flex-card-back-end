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
import { UpdateFlashcardDto } from '../../application/dto/update-flashcard.dto';

@Controller('flashcard')
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @Get('test-search')
  async testSearch(@Request() req: any, @Query('q') q: string) {
    const userId = req?.user?.id ?? '665ed96611f0733b07cc2df6';
    if (!q || q.trim().length === 0) {
      return { message: 'Please provide ?q=term' };
    }

    const prisma = (this.flashcardService as any).flashcardRepo.prisma; // quick access
    const results: any = await prisma.flashcard.aggregateRaw({
      pipeline: [
        {
          $search: {
            index: 'default',
            compound: {
              // filter: [
              //   { equals: { path: 'createdBy', value: { $oid: userId } } },
              // ],
              mustNot: [{ exists: { path: 'deletedAt' } }],
              should: [{ text: { query: q, path: ['front', 'back'] } }],
              minimumShouldMatch: 1,
            },
          },
        },
        { $limit: 10 },
        { $project: { front: 1, back: 1, score: { $meta: 'searchScore' } } },
      ],
    });

    return { q, results };
  }

  @Get()
  list(@Request() req: any, @Query() queries: ListFlashcardsDto) {
    const userId = req?.user?.id ?? '665ed96611f0733b07cc2df6';
    return this.flashcardService.list(userId, {
      page: queries.page,
      size: queries.size,
      tagNames: queries.tagNames ?? [],
      mode: queries.mode ?? 'all',
      sort: queries.sort ?? 'link',
      frontContains: queries.frontContains,
      backContains: queries.backContains,
    });
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
    @Body() body: UpdateFlashcardDto,
  ) {
    const userId = req?.user?.id ?? '665ed96611f0733b07cc2df6';
    return this.flashcardService.edit(userId, id, body);
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
