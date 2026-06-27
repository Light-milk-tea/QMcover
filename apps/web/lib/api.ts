import axios from "axios";
import type { CanvasDocument, GenerateCoverInput } from "@qmcover/shared";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"
});

export interface TemplateDto {
  id: string;
  name: string;
  description?: string;
  platform: string;
  scene: string;
  width: number;
  height: number;
  thumbnailUrl?: string;
  document: CanvasDocument;
}

export interface ProjectDto {
  id: string;
  name: string;
  document: CanvasDocument;
  thumbnailUrl?: string;
  updatedAt: string;
}

export interface GenerationJobDto {
  id: string;
  status: string;
  error?: string;
  candidates?: Array<{
    id: string;
    previewUrl: string;
    document: CanvasDocument;
  }>;
}

export async function fetchTemplates() {
  const response = await api.get<TemplateDto[]>("/templates");
  return response.data;
}

export async function fetchProjects() {
  const response = await api.get<ProjectDto[]>("/projects");
  return response.data;
}

export async function createProject(input: { name: string; templateId?: string; platform?: string }) {
  const response = await api.post<ProjectDto>("/projects", input);
  return response.data;
}

export async function saveProject(projectId: string, document: CanvasDocument, thumbnailUrl?: string) {
  const response = await api.patch<ProjectDto>(`/projects/${projectId}`, {
    name: document.name,
    document,
    thumbnailUrl
  });
  return response.data;
}

export async function createGenerationJob(input: GenerateCoverInput) {
  const response = await api.post<GenerationJobDto>("/generation-jobs", input);
  return response.data;
}

export async function retryGenerationJob(jobId: string) {
  const response = await api.post<GenerationJobDto>(`/generation-jobs/${jobId}/retry`);
  return response.data;
}
