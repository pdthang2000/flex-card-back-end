import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  Request,
} from '@nestjs/common';
import { TagService } from '../../application/services/tag.service';
import { CreateTagDto } from '../../application/dto/create-tag.dto';
import { RenameTagDto } from '../../application/dto/rename-tag.dto';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

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

  @Get()
  list(@Request() req: any) {
    return this.tagService.listTags(req.user.id);
  }
}
