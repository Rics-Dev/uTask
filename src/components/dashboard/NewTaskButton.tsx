import { createSignal } from 'solid-js';
import { isNewTaskOpen } from '../../stores/taskStore.ts';
import { Plus } from "lucide-solid";

export default function NewTaskButton({ projects }: { projects: number }) {
  const [showTooltip, setShowTooltip] = createSignal(false);

  return (
    <button
      onMouseEnter={() => {
        if (projects === 0) setShowTooltip(true);
      }}
      onMouseLeave={() => setShowTooltip(false)}
      disabled={projects === 0}
      class={`relative flex items-center px-4 py-2 rounded-lg 
        ${projects === 0 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      onClick={() => {
        if (projects > 0) isNewTaskOpen.set(true);
      }}
    >
      <Plus class="w-4 h-4 mr-2" />
      <span>{projects > 0 ? 'Nouvelle tache' : 'Nouvelle tache'}</span>
      {projects === 0 && showTooltip() && (
        <span
          class="absolute left-0 right-0 top-full mt-1 px-4 py-2 text-sm text-white bg-gray-800 rounded-lg  transition-opacity"
        >
          Veuillez créer un projet pour ajouter une tâche
        </span>
      )}
    </button>
  );
}

