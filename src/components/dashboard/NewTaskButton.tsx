import { createEffect, createSignal } from 'solid-js';
import { isNewTaskOpen } from '../../stores/taskStore.ts';
import { Plus } from "lucide-solid";
import { useStore } from '@nanostores/solid';
import { projectsStore } from '../../stores/projectsStore.ts';

export default function NewTaskButton() {
  const $projects = useStore(projectsStore);
  const projects = $projects()?.projects || [];
  const [projectsNb, setProjectsNb] = createSignal(projects.length);
  const [showTooltip, setShowTooltip] = createSignal(false);

  createEffect(() => {
    const count = projects.length;
    setProjectsNb(count);
  });
  return (
    <button
      onMouseEnter={() => {
        if (projectsNb() === 0) setShowTooltip(true);
      }}
      onMouseLeave={() => setShowTooltip(false)}
      disabled={projectsNb() === 0}
      class={`relative flex items-center px-5 py-2.5 rounded-xl font-medium transition-all
        ${projectsNb() === 0
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-600 to-indigo-800 text-white hover:shadow-lg hover:shadow-blue-200 active:scale-95'
        }`}
      onClick={() => {
        if (projectsNb() > 0) isNewTaskOpen.set(true);
      }}
    >
      <Plus class="w-5 h-5 mr-2" />
      <span>Nouvelle tache</span>
      {projectsNb() === 0 && showTooltip() && (
        <span class="absolute left-0 right-0 top-full mt-2 px-4 py-2 text-sm text-white bg-gray-800 rounded-lg animate-fade-in">
          Veuillez créer un projet pour ajouter une tâche
        </span>
      )}
    </button>
  );
}
