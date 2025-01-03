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
      class={`relative flex items-center px-4 py-2 rounded-lg 
        ${projectsNb() === 0 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      onClick={() => {
        if (projectsNb() > 0) isNewTaskOpen.set(true);
      }}
    >
      <Plus class="w-4 h-4 mr-2" />
      <span>{projectsNb() > 0 ? 'Nouvelle tache' : 'Nouvelle tache'}</span>
      {projectsNb() === 0 && showTooltip() && (
        <span
          class="absolute left-0 right-0 top-full mt-1 px-4 py-2 text-sm text-white bg-gray-800 rounded-lg  transition-opacity"
        >
          Veuillez créer un projet pour ajouter une tâche
        </span>
      )}
    </button>
  );
}

