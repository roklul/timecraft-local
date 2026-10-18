import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeWorklogs, removeProjectAndWorklogs, renameProjectAndWorklogs } from '../lib/sync.ts';
import type { ProjectItem } from '../types/project.ts';
import type { WorklogItem } from '../types/worklog.ts';

const project: ProjectItem = {
  id: 'project-1',
  name: '原專案',
  color: '#000000',
  status: 'active',
  estimatedHours: 10,
  projectType: 'project',
  scope: 'work',
};

function worklog(overrides: Partial<WorklogItem> = {}): WorklogItem {
  return {
    id: 'worklog-1',
    notionPageId: 'notion-1',
    taskName: '任務',
    project: project.name,
    projectId: project.id,
    scope: 'work',
    category: 'Coding',
    date: '2026-10-14',
    startTime: '09:00',
    endTime: '10:00',
    hours: 1,
    progress: 50,
    syncStatus: 'synced',
    ...overrides,
  };
}

test('pending 本地修改不會被較舊的遠端資料覆蓋', () => {
  const local = worklog({ taskName: '本地新版', syncStatus: 'pending', updatedAt: '2026-10-14T10:00:00Z' });
  const remote = worklog({ id: 'notion-notion-1', taskName: '遠端舊版', syncStatus: 'synced', updatedAt: '2026-10-14T09:00:00Z' });
  assert.equal(mergeWorklogs([local], [remote])[0].taskName, '本地新版');
});

test('已同步項目可接受較新的遠端版本並保留本地 id', () => {
  const local = worklog({ updatedAt: '2026-10-14T09:00:00Z' });
  const remote = worklog({ id: 'notion-notion-1', taskName: '遠端新版', updatedAt: '2026-10-14T10:00:00Z' });
  const merged = mergeWorklogs([local], [remote])[0];
  assert.equal(merged.taskName, '遠端新版');
  assert.equal(merged.id, local.id);
});

test('專案改名以 projectId 遷移關聯工時並標記 pending', () => {
  const updatedProject = { ...project, name: '新專案', scope: 'personal' as const };
  const result = renameProjectAndWorklogs([project], [worklog()], updatedProject);
  assert.equal(result.renamedCount, 1);
  assert.equal(result.worklogs[0].project, '新專案');
  assert.equal(result.worklogs[0].scope, 'personal');
  assert.equal(result.worklogs[0].syncStatus, 'pending');
});

test('刪除專案只刪除相同 projectId 的工時', () => {
  const other = worklog({ id: 'worklog-2', projectId: 'project-2', project: '同名也不應刪除' });
  const result = removeProjectAndWorklogs([project], [worklog(), other], project.id);
  assert.equal(result.removedWorklogs.length, 1);
  assert.deepEqual(result.worklogs.map((item) => item.id), ['worklog-2']);
});

test('同名的工作與個人專案仍以 projectId 分開', () => {
  const personalProject = { ...project, id: 'project-personal', scope: 'personal' as const };
  const personalLog = worklog({
    id: 'worklog-personal',
    projectId: personalProject.id,
    scope: 'personal',
  });
  const result = removeProjectAndWorklogs(
    [project, personalProject],
    [worklog(), personalLog],
    personalProject.id
  );
  assert.deepEqual(result.worklogs.map((item) => item.id), ['worklog-1']);
});

