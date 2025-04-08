/**
 * Types related to quantum projects
 */

export type ProjectType = 'circuit' | 'algorithm' | 'quantum-model' | 'agent';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  language: string;
  framework: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  type: ProjectType;
  lastOpened: string;
  githubRepo: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  type: ProjectType;
}

export interface ProjectSettings {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  sdkType?: string;
  tags?: string[];
}
