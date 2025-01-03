import { createSignal, createEffect } from "solid-js";
import { tasksStore } from "../../stores/taskStore";

const priorities = ["high", "medium", "low"];
const statuses = ["not_started", "in_progress", "waiting", "completed"];

const TaskFilters = () => {
  const [selectedPriorities, setSelectedPriorities] = createSignal<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = createSignal<string[]>([]);
  const [selectedDate, setSelectedDate] = createSignal<string>("");

  // Function to handle changes in priority filters
  const handlePriorityChange = (priority: string) => {
    setSelectedPriorities(prev =>
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  // Function to handle changes in status filters
  const handleStatusChange = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  // Function to handle date selection
  const handleDateChange = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    setSelectedDate(select.value);
  };

  // Automatically apply filters whenever the filters change
  createEffect(() => {
    const tasks = tasksStore.get().tasks.filter(task =>
      (selectedPriorities().length === 0 || selectedPriorities().includes(task.priority)) &&
      (selectedStatuses().length === 0 || selectedStatuses().includes(task.status))
    );

    tasksStore.set({ tasks });
  });

  return (
    <div class="space-y-6">
      <h3 class="text-lg font-semibold text-gray-900">Filtres</h3>

      <div class="space-y-6">
        {/* Priority Filter */}
        <div>
          <label class="text-sm font-medium text-gray-700 mb-3 block">Priorité</label>
          <div class="space-y-3">
            {priorities.map((priority) => (
              <label class="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  value={priority}
                  onChange={() => handlePriorityChange(priority)}
                />
                <span class="ml-3 text-sm text-gray-600 group-hover:text-gray-900 capitalize transition-colors">
                  {priority}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label class="text-sm font-medium text-gray-700 mb-3 block">Statut</label>
          <div class="space-y-3">
            {statuses.map((status) => (
              <label class="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  value={status}
                  onChange={() => handleStatusChange(status)}
                />
                <span class="ml-3 text-sm text-gray-600 group-hover:text-gray-900 capitalize transition-colors">
                  {status.replace("_", " ")}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Filter */}
        <div>
          <label class="text-sm font-medium text-gray-700 mb-3 block">Échéance</label>
          <select
            class="w-full rounded-xl border-gray-300 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
            onChange={handleDateChange}
          >
            <option value="">Sélectionner une date</option>
            <option value="today">Aujourd'hui</option>
            <option value="this_week">Cette semaine</option>
            <option value="this_month">Ce mois</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;

