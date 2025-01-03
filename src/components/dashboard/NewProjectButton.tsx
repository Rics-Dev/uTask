import { isNewProjectOpen } from '../../stores/projectsStore.ts';
import { Plus } from "lucide-solid";

export default function NewProjectButton() {

  return (
    <button
      class="flex items-center mx-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      onClick={() => {
        isNewProjectOpen.set(true);
      }}
    >
      <Plus class="w-4 h-4 mr-2" />
      < span >Nouveau projet</span >
    </button >
  );
}

