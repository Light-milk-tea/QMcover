import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiModule } from "./modules/ai/ai.module";
import { AssetsModule } from "./modules/assets/assets.module";
import { GenerationModule } from "./modules/generation/generation.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { TemplatesModule } from "./modules/templates/templates.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TemplatesModule,
    ProjectsModule,
    AssetsModule,
    AiModule,
    GenerationModule
  ]
})
export class AppModule {}
