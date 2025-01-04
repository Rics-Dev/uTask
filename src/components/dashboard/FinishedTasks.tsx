import { CheckCircle } from "lucide-solid";
import { useStore } from "@nanostores/solid";
import { tasksStore } from "../../stores/taskStore.ts";
import { createEffect, createSignal } from "solid-js";


export default function FinishedTasks() {
  const $tasks = useStore(tasksStore);
  const tasks = $tasks()?.tasks || [];
  const [inProgressCount, setInProgressCount] = createSignal(tasks.filter((task) => task.status === "completed").length);

  createEffect(() => {
    const count = tasks.filter((task) => task.status === "completed").length;
    setInProgressCount(count);
  });

  return (
    <div class="bg-white rounded-2xl shadow-md shadow-emerald-100/50 p-6 border border-emerald-50 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-emerald-600 mb-1">Tâches terminées</p>
          <p class="text-3xl font-bold text-gray-900">{inProgressCount()}</p>
        </div>
        <div class="bg-gradient-to-br from-emerald-100 to-emerald-200 p-3.5 rounded-xl">
          <CheckCircle class="w-7 h-7 text-emerald-600" />
        </div>
      </div>
    </div>
  );
}
