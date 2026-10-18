import type { ProjectItem } from '@/types/project';
import type { WorklogItem } from '@/types/worklog';

function timestamp(value?: string): number {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function migrateWorklogProjectLinks(
  worklogs: WorklogItem[],
  projects: ProjectItem[]
): WorklogItem[] {
  const projectsByName = new Map(projects.map((project) => [project.name, project]));
  return worklogs.map((worklog) => {
    const project = projectsByName.get(worklog.project);
    return {
      ...worklog,
      projectId: worklog.projectId || project?.id,
      scope: worklog.scope || project?.scope || 'work',
    };
  });
}

export function mergeWorklogs(
  localItems: WorklogItem[],
  remoteItems: WorklogItem[]
): WorklogItem[] {
  const merged = [...localItems];

  for (const remote of remoteItems) {
    const index = merged.findIndex(
      (local) =>
        (local.notionPageId && local.notionPageId === remote.notionPageId) || local.id === remote.id
    );
    if (index < 0) {
      merged.push({ ...remote, syncStatus: 'synced' });
      continue;
    }

    const local = merged[index];
    const localIsNewer = timestamp(local.updatedAt) > timestamp(remote.updatedAt);
    if (local.syncStatus === 'pending' || local.syncStatus === 'failed' || localIsNewer) continue;

    merged[index] = {
      ...local,
      ...remote,
      id: local.id,
      projectId: remote.projectId || local.projectId,
      scope: remote.scope || local.scope || 'work',
      syncStatus: 'synced',
    };
  }

  return merged;
}

export function renameProjectAndWorklogs(
  projects: ProjectItem[],
  worklogs: WorklogItem[],
  updatedProject: ProjectItem
): { projects: ProjectItem[]; worklogs: WorklogItem[]; renamedCount: number } {
  const previous = projects.find((project) => project.id === updatedProject.id);
  const nextProjects = previous
    ? projects.map((project) => (project.id === updatedProject.id ? updatedProject : project))
    : [updatedProject, ...projects];

  if (!previous) return { projects: nextProjects, worklogs, renamedCount: 0 };

  let renamedCount = 0;
  const nextWorklogs = worklogs.map((worklog) => {
    const belongsToProject = worklog.projectId
      ? worklog.projectId === previous.id
      : worklog.project === previous.name;
    if (!belongsToProject) return worklog;
    renamedCount += 1;
    return {
      ...worklog,
      projectId: updatedProject.id,
      project: updatedProject.name,
      scope: updatedProject.scope,
      syncStatus: 'pending' as const,
      updatedAt: new Date().toISOString(),
    };
  });

  return { projects: nextProjects, worklogs: nextWorklogs, renamedCount };
}

export function removeProjectAndWorklogs(
  projects: ProjectItem[],
  worklogs: WorklogItem[],
  projectId: string
): { projects: ProjectItem[]; worklogs: WorklogItem[]; removedWorklogs: WorklogItem[] } {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return { projects, worklogs, removedWorklogs: [] };
  const belongs = (worklog: WorklogItem) =>
    worklog.projectId ? worklog.projectId === projectId : worklog.project === project.name;
  const removedWorklogs = worklogs.filter(belongs);
  return {
    projects: projects.filter((item) => item.id !== projectId),
    worklogs: worklogs.filter((worklog) => !belongs(worklog)),
    removedWorklogs,
  };
}
