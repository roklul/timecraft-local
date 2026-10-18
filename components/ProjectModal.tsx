'use client';

import React, { useState, useEffect } from 'react';
import { ProjectItem, PROJECT_COLORS, ProjectScope, ProjectStatus, ProjectType } from '@/types/project';
import { X, FolderPlus, Palette, Clock, FileText, CheckCircle2, Trash2, Wrench, Target } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: ProjectItem) => void;
  onDelete?: (id: string) => void;
  initialData?: ProjectItem | null;
  defaultScope?: ProjectScope;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  defaultScope = 'work',
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0].hex);
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [projectType, setProjectType] = useState<ProjectType>('project');
  const [scope, setScope] = useState<ProjectScope>('work');
  const [estimatedHours, setEstimatedHours] = useState(20);
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setColor(initialData.color || PROJECT_COLORS[0].hex);
      setStatus(initialData.status || 'active');
      setScope(initialData.scope || 'work');
      const isMaint =
        initialData.projectType === 'maintenance' ||
        /graylog|zabbix|維運|運維|監控/i.test(initialData.name || '');
      setProjectType(isMaint ? 'maintenance' : 'project');
      setEstimatedHours(initialData.estimatedHours ?? (isMaint ? 0 : 20));
      setDescription(initialData.description || '');
    } else {
      setName('');
      setColor(PROJECT_COLORS[0].hex);
      setStatus('active');
      setProjectType('project');
      setScope(defaultScope);
      setEstimatedHours(20);
      setDescription('');
    }
    setErrorMsg('');
  }, [initialData, isOpen, defaultScope]);

  // 當使用者在新增專案時輸入名稱包含 graylog, zabbix 等維運關鍵字，自動建議切換為維運案
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && /graylog|zabbix|維運|運維|監控/i.test(val)) {
      setProjectType('maintenance');
      if (estimatedHours === 20) {
        setEstimatedHours(0);
      }
    }
  };

  const handleTypeSelect = (type: ProjectType) => {
    setProjectType(type);
    if (type === 'maintenance' && estimatedHours === 20) {
      setEstimatedHours(0);
    } else if (type === 'project' && estimatedHours === 0) {
      setEstimatedHours(20);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('請輸入專案名稱');
      return;
    }

    const item: ProjectItem = {
      id: initialData?.id || `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      color,
      status,
      scope,
      projectType,
      estimatedHours: Number(estimatedHours) || 0,
      description: description.trim(),
      notionPageId: initialData?.notionPageId,
      updatedAt: new Date().toISOString(),
    };

    onSave(item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: color }}
            >
              {projectType === 'maintenance' ? <Wrench className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                {isEditing
                  ? projectType === 'maintenance'
                    ? '編輯維運案'
                    : '編輯專案'
                  : projectType === 'maintenance'
                  ? '新增維運案 (Maintenance)'
                  : '新增專案 (Project)'}
              </h2>
              <p className="text-xs text-zinc-400">
                {projectType === 'maintenance'
                  ? '常態維運追蹤、無固定起訖限制 (如 Graylog、Zabbix)'
                  : '設定專案目標工時與識別標籤 (有明確目標與起訖)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">專案領域</label>
            <div className="grid grid-cols-2 gap-2">
              {(['work', 'personal'] as ProjectScope[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScope(value)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    scope === value
                      ? value === 'work'
                        ? 'border-blue-500 bg-blue-500/15 text-blue-200'
                        : 'border-purple-500 bg-purple-500/15 text-purple-200'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                  }`}
                >
                  {value === 'work' ? '💼 工作專案' : '🌱 個人專案'}
                </button>
              ))}
            </div>
          </div>

          {/* 專案屬性切換 (一般專案 vs 常態維運案) */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              項目屬性類型 <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeSelect('project')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  projectType === 'project'
                    ? 'bg-blue-600/15 border-blue-500 text-blue-200'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                  <span>📌 一般專案</span>
                </div>
                <span className="text-[11px] text-zinc-400 leading-relaxed">
                  有目標起訖與時數預估，如系統開發、改版上線
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('maintenance')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  projectType === 'maintenance'
                    ? 'bg-emerald-600/15 border-emerald-500 text-emerald-200'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🛠️ 常態維運案</span>
                </div>
                <span className="text-[11px] text-zinc-400 leading-relaxed">
                  無明顯起訖，如 Graylog、Zabbix 監控、優化與告警
                </span>
              </button>
            </div>
          </div>

          {/* 專案名稱 */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              {projectType === 'maintenance' ? '維運案名稱' : '專案名稱'} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={projectType === 'maintenance' ? '例如：Graylog、Zabbix 伺服器監控' : '例如：電商平台重構、AI 助理介面'}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition text-xs"
            />
          </div>

          {/* 色彩選擇器 */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-zinc-400" />
              識別色彩標籤
            </label>
            <div className="flex items-center gap-2 flex-wrap p-2 bg-zinc-950 border border-zinc-800 rounded-xl">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-7 h-7 rounded-lg transition-all ${
                    color === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* 狀態與預估工時 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">執行狀態</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="active">進行中 (Active)</option>
                <option value="completed">已完成 (Completed)</option>
                <option value="on_hold">暫停中 (On Hold)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {projectType === 'maintenance' ? '基準工時 (填 0 無上限)' : '預估目標工時 (hr)'}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {projectType === 'maintenance' && (
            <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-emerald-300 text-[11px] leading-relaxed flex items-center gap-2">
              <span>💡</span>
              <span>維運案為常態任務，累計工時將客觀呈現，不強制限制上限與截止日。</span>
            </div>
          )}

          {/* 說明備註 */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              {projectType === 'maintenance' ? '維運範疇與日常監控目標' : '專案目標或說明'}
            </label>
            <textarea
              rows={2}
              placeholder={
                projectType === 'maintenance'
                  ? '例如：伺服器主機與網路設備監控、觸發器告警、Log 收集與規則優化...'
                  : '簡要描述此專案範疇與重要目標...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition text-xs"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  const typeLabel = projectType === 'maintenance' ? '維運案' : '專案';
                  if (
                    confirm(
                      `確定要刪除${typeLabel}「${name}」嗎？\n\n⚠️ 注意：此${typeLabel}關聯的所有每日工時記錄將會一併徹底刪除！`
                    )
                  ) {
                    onDelete(initialData!.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                刪除{projectType === 'maintenance' ? '維運案' : '專案'} (含關聯工時)
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {projectType === 'maintenance' ? '儲存維運案' : '儲存專案'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
