import { useStore } from "@nanostores/solid";
import { createEffect, createSignal, For, Show } from "solid-js";
import { tasksStore } from "../../stores/taskStore";
import { projectsStore } from "../../stores/projectsStore";

function ProjectList(props: any) {
  projectsStore.set({ projects: props.projects });
  const $tasks = useStore(tasksStore);
  const $projects = useStore(projectsStore);

  // Signal to store the computed stats
  const [stats, setStats] = createSignal<Record<string, { total: number; completed: number; progress: number }>>({});

  // Effect to compute stats whenever tasks or projects change
  createEffect(() => {
    const tasks = $tasks()?.tasks || [];
    const projects = $projects()?.projects || [];

    const newStats: Record<string, { total: number; completed: number; progress: number }> = {};

    projects.forEach((project) => {
      const projectTasks = tasks.filter((task) => task.projectId === project.id);
      const total = projectTasks.length;
      const completed = projectTasks.filter((task) => task.status === "completed").length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      newStats[project.id] = { total, completed, progress };
    });

    setStats(newStats);
  });

  const statusColors: any = {
    planning: "bg-yellow-500",
    active: "bg-green-500",
    on_hold: "bg-orange-500",
    completed: "bg-blue-500",
    cancelled: "bg-red-500",
  };

  return (
    <div class="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-xl font-bold text-gray-900">Projets Actifs</h2>
      </div>
      <div class="space-y-6">
        <Show
          when={($projects()?.projects ?? []).length > 0}
          fallback={
            <div class="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
              <p class="font-medium">Aucun projet disponible. Ajoutez un nouveau projet pour commencer.</p>
            </div>
          }
        >
          <For each={$projects()?.projects}>
            {(project) => {
              const projectStats = stats()[project.id] || { total: 0, completed: 0, progress: 0 };
              return (
                <div class="space-y-3 p-6 hover:bg-gray-50 rounded-lg transition border border-gray-100">
                  <div class="flex items-center justify-between">
                    <div class="space-y-1">
                      <h3 class="font-semibold text-gray-900">{project.name}</h3>
                      <p class="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                    </div>
                    <span class={`px-3 py-1 rounded-full text-xs text-white ${statusColors[project.status]}`}>
                      {project.status}
                    </span>
                  </div>
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Progression</span>
                      <span class="font-medium">
                        {projectStats.completed}/{projectStats.total} tâches
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${projectStats.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </Show>
      </div>
    </div>
  );
}

export default ProjectList;
