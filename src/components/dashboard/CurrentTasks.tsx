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
    <div class="bg-white rounded-2xl shadow-md shadow-blue-100/50 p-6 border border-blue-50 hover:shadow-xl transition-shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-blue-600 mb-1">Tâches en cours</p>
          <p class="text-3xl font-bold text-gray-900">{inProgressCount()}</p>
        </div>
        <div class="bg-gradient-to-br from-blue-100 to-blue-200 p-3.5 rounded-xl">
          <Clock class="w-7 h-7 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
