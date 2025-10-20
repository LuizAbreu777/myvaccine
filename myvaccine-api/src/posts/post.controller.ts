import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { UserRole } from "../users/user.entity";
import { CreatePostDto, UpdatePostDto } from "./dto/post.dto";
import { Post as PostEntity, PostStatus } from "./post.entity";

@Controller("posts")
export class PostController {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createPostDto: CreatePostDto) {
    const post = this.postRepository.create(createPostDto);
    return this.postRepository.save(post);
  }

  @Get()
  async findAll() {
    return this.postRepository.find({
      order: { id: "DESC" },
    });
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.postRepository.findOne({
      where: { id: +id },
      relations: ["stocks", "stocks.vaccine"],
    });
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param("id") id: string, @Body() updatePostDto: UpdatePostDto) {
    await this.postRepository.update(id, updatePostDto);
    return this.postRepository.findOne({ where: { id: +id } });
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param("id") id: string) {
    await this.postRepository.delete(id);
    return { message: "Posto removido com sucesso" };
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleStatus(@Param("id") id: string) {
    const post = await this.postRepository.findOne({ where: { id: +id } });
    if (!post) {
      throw new Error("Posto não encontrado");
    }

    const newStatus = post.status === PostStatus.ACTIVE ? PostStatus.INACTIVE : PostStatus.ACTIVE;
    await this.postRepository.update(id, { status: newStatus as PostStatus });

    return this.postRepository.findOne({ where: { id: +id } });
  }
}
