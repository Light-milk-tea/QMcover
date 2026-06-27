"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { CanvasDocument, GenerateCoverInput, PlatformPreset } from "@qmcover/shared";
import { createGenerationJob, createProject, fetchProjects, fetchTemplates, retryGenerationJob, saveProject, type GenerationJobDto, type ProjectDto, type TemplateDto } from "../lib/api";
import { useEditorStore } from "../lib/editor-store";

const CanvasEditor = dynamic(() => import("../components/editor/canvas-editor").then((module) => module.CanvasEditor), {
  ssr: false,
  loading: () => <div className="rounded-3xl border border-slate-200 bg-white p-10 text-slate-500">编辑器加载中...</div>
});

const defaultGenerationInput: GenerateCoverInput = {
  title: "7 天学会 AI 绘画",
  subtitle: "零基础入门教程",
  keywords: ["AI", "教程", "效率"],
  style: "粉色科技感，适合知识博主",
  platform: "xiaohongshu",
  count: 4
};

export default function HomePage() {
  const [templates, setTemplates] = useState<TemplateDto[]>([]);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [generationInput, setGenerationInput] = useState(defaultGenerationInput);
  const [job, setJob] = useState<GenerationJobDto | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const setDocument = useEditorStore((state) => state.setDocument);

  useEffect(() => {
    void Promise.all([fetchTemplates(), fetchProjects()]).then(([templateItems, projectItems]) => {
      setTemplates(templateItems);
      setProjects(projectItems);
    });
  }, []);

  async function handleCreateFromTemplate(template: TemplateDto) {
    const project = await createProject({ name: template.name, templateId: template.id, platform: template.platform });
    setProjectId(project.id);
    setDocument(project.document);
    setProjects((items) => [project, ...items]);
  }

  async function handleOpenProject(project: ProjectDto) {
    setProjectId(project.id);
    setDocument(project.document);
  }

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const nextJob = await createGenerationJob(generationInput);
      setJob(nextJob);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRetry() {
    if (!job) {
      return;
    }

    setIsGenerating(true);
    try {
      setJob(await retryGenerationJob(job.id));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleUseCandidate(document: CanvasDocument) {
    const project = await createProject({ name: document.name, platform: document.canvas.platform });
    await saveProject(project.id, document);
    setProjectId(project.id);
    setDocument(document);
    setProjects((items) => [{ ...project, document }, ...items]);
  }

  function updateGenerationInput(patch: Partial<GenerateCoverInput>) {
    setGenerationInput((current) => ({ ...current, ...patch }));
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-8 flex flex-col gap-4 rounded-[2rem] bg-slate-950 p-8 text-white md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-violet-200">模板 + AI + 深度编辑</p>
          <h1 className="mt-2 text-4xl font-black">封面喵</h1>
          <p className="mt-3 max-w-2xl text-slate-300">用设计编排 AI 生成可编辑画布，用 FLUX 生成高质量主视觉，再进入画布精修和导出。</p>
        </div>
        <button
          className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950"
          onClick={async () => {
            const project = await createProject({ name: "空白封面", platform: "xiaohongshu" });
            setProjectId(project.id);
            setDocument(project.document);
            setProjects((items) => [project, ...items]);
          }}
        >
          新建空白项目
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">AI 生成候选</h2>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-xl border px-3 py-2" value={generationInput.title} onChange={(event) => updateGenerationInput({ title: event.target.value })} placeholder="标题" />
              <input className="w-full rounded-xl border px-3 py-2" value={generationInput.subtitle} onChange={(event) => updateGenerationInput({ subtitle: event.target.value })} placeholder="副标题" />
              <input
                className="w-full rounded-xl border px-3 py-2"
                value={generationInput.keywords.join(",")}
                onChange={(event) => updateGenerationInput({ keywords: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
                placeholder="关键词，用逗号分隔"
              />
              <textarea className="min-h-24 w-full rounded-xl border px-3 py-2" value={generationInput.style} onChange={(event) => updateGenerationInput({ style: event.target.value })} placeholder="风格和品牌约束" />
              <select className="w-full rounded-xl border px-3 py-2" value={generationInput.platform} onChange={(event) => updateGenerationInput({ platform: event.target.value as PlatformPreset })}>
                <option value="xiaohongshu">小红书</option>
                <option value="bilibili">B 站</option>
                <option value="douyin">抖音</option>
                <option value="ecommerce">电商图</option>
              </select>
              <button className="w-full rounded-xl bg-brand-700 px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={isGenerating} onClick={handleGenerate}>
                {isGenerating ? "生成中..." : "生成 4 张候选"}
              </button>
            </div>
          </div>

          {job?.candidates && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">候选封面</h2>
              <div className="mt-4 grid gap-3">
                {job.candidates.map((candidate, index) => (
                  <button key={candidate.id} className="rounded-2xl border p-3 text-left hover:border-brand-500" onClick={() => handleUseCandidate(candidate.document)}>
                    <div className="h-28 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url("${candidate.previewUrl}")` }} />
                    <p className="mt-2 font-medium">方案 {index + 1}</p>
                    <p className="text-sm text-slate-500">点击创建项目并进入编辑器</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {job?.status === "failed" && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
              <h2 className="font-semibold">生成失败</h2>
              <p className="mt-2 text-sm">{job.error ?? "请稍后重试"}</p>
              <button className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white" onClick={handleRetry} disabled={isGenerating}>
                重试生成
              </button>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">模板库</h2>
            <div className="mt-4 grid gap-3">
              {templates.map((template) => (
                <button key={template.id} className="rounded-2xl border p-3 text-left hover:border-brand-500" onClick={() => handleCreateFromTemplate(template)}>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-slate-500">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">最近项目</h2>
            <div className="mt-4 grid gap-2">
              {projects.map((project) => (
                <button key={project.id} className="rounded-xl border px-3 py-2 text-left text-sm hover:border-brand-500" onClick={() => handleOpenProject(project)}>
                  {project.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <CanvasEditor projectId={projectId} />
        </section>
      </div>
    </main>
  );
}
