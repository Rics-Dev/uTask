
import { createSignal, createEffect } from "solid-js";
import { useStore } from "@nanostores/solid";
import { tasksStore, initializeTasks, addNanoTask } from "../../stores/taskStore.ts";
import { Calendar, Clock, Users } from "lucide-solid";

function TaskGrid(props: any) {
  const $tasks = useStore(tasksStore);


  return (
    <div class="bg-white rounded-xl shadow-sm p-6" id="task-grid">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900">Tâches Récentes</h2>

        {props.showFilters && (
          <div class="flex items-center space-x-4">
            <select class="rounded-md border-gray-300 text-sm">
              <option>Trier par date</option>
              <option>Trier par priorité</option>
              <option>Trier par statut</option>
            </select>
          </div>
        )}
      </div>

      <div class="space-y-4" id="task-list">
        {$tasks().tasks.map((task) => (
          <div
            class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            data-task-id={task.id}
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  class="rounded text-blue-600"
                  checked={task.status === "completed"}
                  onChange={() => {
                    const updatedTask = {
                      ...task,
                      status: task.status === "completed" ? "pending" : "completed",
                    };
                    const tasks = $tasks().tasks.map((t) =>
                      t.id === task.id ? updatedTask : t
                    );
                    tasksStore.set({ tasks });
                  }}
                />
                <h3 class="font-medium text-gray-900">{task.title}</h3>
              </div>

              <div class="flex items-center space-x-2">
                {task.isRecurring && (
                  <span class="text-gray-500">
                    <Clock class="w-4 h-4" />
                  </span>
                )}

                <span
                  class={`px-2 py-1 rounded-full text-xs ${task.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : task.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                    }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>

            {props.view === "detailed" && (
              <p class="text-sm text-gray-600 mb-3">{task.description}</p>
            )}

            <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                class="bg-blue-600 h-2 rounded-full"
                style={{ width: `${task.progress}%` }}
              />
            </div>

            <div class="flex items-center justify-between text-sm text-gray-500">
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <Users class="w-4 h-4" />
                  <span>{task.assignedTo}</span>
                </div>

                <div class="flex items-center space-x-2">
                  <Calendar class="w-4 h-4" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskGrid;
