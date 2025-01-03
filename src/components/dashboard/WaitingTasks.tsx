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
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Tâches en attentes</p>
          <p class="text-2xl font-bold text-gray-900">{inProgressCount()}</p>
        </div>
        <div class="bg-red-100 p-3 rounded-lg">
          <PauseCircle class="w-6 h-6 text-red-600" />
        </div>
      </div>
    </div>
  );
}
