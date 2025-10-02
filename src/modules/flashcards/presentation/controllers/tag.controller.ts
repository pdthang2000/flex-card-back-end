import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  Request,
  Query,
} from '@nestjs/common';
import { TagService } from '../../application/services/tag.service';
import { CreateTagDto } from '../../application/dto/create-tag.dto';
import { RenameTagDto } from '../../application/dto/rename-tag.dto';
import { ListFlashcardsInTagQueryDto } from '../../application/dto/list-flashcards-in-tag.query';
import { FlashcardService } from '../../application/services/flashcard.service';

@Controller('tag')
export class TagController {
  constructor(
    private readonly tagService: TagService,
    private readonly flashcardService: FlashcardService,
  ) {}

  @Get()
  list(@Request() req: any) {
    return this.tagService.listTags(req.user.id);
  }

  @Get(':id/flashcards')
  listFlashcardsInTag(
    @Request() req: any,
    @Param('id') id: string,
    @Query() query: ListFlashcardsInTagQueryDto,
  ) {
    const userId = '665ed96611f0733b07cc2df6';
    return this.flashcardService.listByTag(
      req?.user?.id ?? userId,
      id,
      query.page,
      query.size,
    );
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateTagDto) {
    const userId = '665ed96611f0733b07cc2df6';
    return this.tagService.createTag(userId, dto.name);
  }

  @Patch(':id')
  rename(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: RenameTagDto,
  ) {
    return this.tagService.renameTag(req.user.id, id, dto.name);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.tagService.deleteTag(req.user.id, id);
  }
}
