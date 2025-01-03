import { PauseCircle } from "lucide-solid";
import { useStore } from "@nanostores/solid";
import { tasksStore } from "../../stores/taskStore.ts";
import { createEffect, createSignal } from "solid-js";


export default function WaitingTasks() {
  const $tasks = useStore(tasksStore);
  const tasks = $tasks()?.tasks || [];
  const [inProgressCount, setInProgressCount] = createSignal(tasks.filter((task) => task.status === "waiting").length);

  createEffect(() => {
    const count = tasks.filter((task) => task.status === "waiting").length;
    setInProgressCount(count);
  });

  return (
    <div class="bg-white rounded-2xl shadow-md shadow-orange-100/50 p-6 border border-orange-50 hover:shadow-xl transition-shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-orange-600 mb-1">Tâches en attentes</p>
          <p class="text-3xl font-bold text-gray-900">{inProgressCount()}</p>
        </div>
        <div class="bg-gradient-to-br from-orange-100 to-orange-200 p-3.5 rounded-xl">
          <PauseCircle class="w-7 h-7 text-orange-600" />
        </div>
      </div>
    </div>
  );
}
