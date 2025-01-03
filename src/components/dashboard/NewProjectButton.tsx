import { isNewProjectOpen } from '../../stores/projectsStore.ts';
import { Plus } from "lucide-solid";

export default function NewProjectButton() {
  return (
    <button
      class="flex items-center px-3 py-2.5 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-200 transition-all active:scale-95"
      onClick={() => {
        isNewProjectOpen.set(true);
      }}
    >
      <Plus class="w-5 h-5 mr-2" />
      <span>Nouveau projet</span>
    </button>
  );
}
