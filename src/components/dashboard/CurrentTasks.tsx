import { Clock } from "lucide-solid";
import { useStore } from "@nanostores/solid";
import { tasksStore } from "../../stores/taskStore.ts";
import { createEffect, createSignal } from "solid-js";


export default function CurrentTasks() {
  const $tasks = useStore(tasksStore);
  const tasks = $tasks()?.tasks || [];
  const [inProgressCount, setInProgressCount] = createSignal(tasks.filter((task) => task.status === "in_progress").length);

  createEffect(() => {
    const count = tasks.filter((task) => task.status === "in_progress").length;
    setInProgressCount(count);
  });

  return (
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Tâches en cours</p>
          <p class="text-2xl font-bold text-gray-900">{inProgressCount()}</p>
        </div>
        <div class="bg-blue-100 p-3 rounded-lg">
          <Clock class="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
