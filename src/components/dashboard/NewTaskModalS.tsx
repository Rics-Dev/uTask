import { createEffect, createSignal, Show } from "solid-js";
import { actions } from 'astro:actions';
import { useStore } from "@nanostores/solid";
import { addNanoTask, isNewTaskOpen } from "../../stores/taskStore";

export default function NewTaskModalS({ user, users, projects }: { user: any, users: any, projects: any }) {
  const $isNewTaskOpen = useStore(isNewTaskOpen);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isVisible, setIsVisible] = createSignal(false);
  const [formData, setFormData] = createSignal({
    title: "",
    description: "",
    priority: "medium",
    status: "in_progress",
    estimatedHours: "",
    actualHours: "",
    labels: "",
    dueDate: "",
    assignedTo: users[0]?.id || "",
    projectId: projects[0]?.id || "",
    createdBy: user?.userId || 0,
    progress: 0,
    isRecurring: false,
    recurringPattern: "daily",
  });

  const [progressDisplay, setProgressDisplay] = createSignal("0%");

  createEffect(() => {
    if ($isNewTaskOpen()) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        document.querySelector('.modal-content')?.classList.remove('scale-95', 'opacity-0');
        document.querySelector('.modal-backdrop')?.classList.remove('opacity-0');
      });
    } else {
      document.querySelector('.modal-content')?.classList.add('scale-95', 'opacity-0');
      document.querySelector('.modal-backdrop')?.classList.add('opacity-0');
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  });

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData(),
      [name]: type === "checkbox" ? checked : value,
    });

    if (name === "progress") {
      setProgressDisplay(`${value}%`);
    }
  };

  const showToast = (message: string) => {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    if (toast && toastMessage) {
      toastMessage.textContent = message;
      toast.classList.remove("translate-x-full", "right-0");
      toast.classList.add("right-6");

      setTimeout(() => {
        toast.classList.add("translate-x-full");
        toast.classList.remove("right-6");
        toast.classList.add("right-0");
      }, 3000);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formDataObj = new FormData();
      const data = formData();

      // Ensure all values are properly converted to strings
      Object.entries(data).forEach(([key, value]) => {
        // Handle empty numeric values
        if (typeof value === 'number' && !Number.isFinite(value)) {
          formDataObj.append(key, '0');
        } else if (typeof value === 'boolean') {
          formDataObj.append(key, value.toString());
        } else if (value === null || value === undefined) {
          formDataObj.append(key, '');
        } else {
          formDataObj.append(key, value.toString());
        }
      });

      const { data: responseData, error } = await actions.addTask(formDataObj);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (responseData) {
        addNanoTask(responseData.task);
        // Reset form and show success message
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          status: "in_progress",
          estimatedHours: "",
          actualHours: "",
          labels: "",
          dueDate: "",
          assignedTo: users[0]?.id || "",
          projectId: projects[0]?.id || "",
          createdBy: user?.userId || 0,
          progress: 0,
          isRecurring: false,
          recurringPattern: "daily",
        });
        setErrorMessage(null);
        showToast("Tâche ajoutée avec succès!");
        closeModal();
      }
    } catch (error) {
      setErrorMessage("Une erreur inattendue s'est produite.");
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    isNewTaskOpen.set(false);
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "in_progress",
      estimatedHours: "",
      actualHours: "",
      labels: "",
      dueDate: "",
      assignedTo: users[0]?.id || "",
      projectId: projects[0]?.id || "",
      createdBy: user?.userId || 0,
      progress: 0,
      isRecurring: false,
      recurringPattern: "daily",
    });
  };

  return (
    <Show when={isVisible()}>
      <div
        class="fixed inset-0 bg-gray-900 bg-opacity-70 overflow-y-auto h-full w-full z-50 transition-opacity duration-300 ease-in-out modal-backdrop opacity-0"
        onClick={(e) => e.target === e.currentTarget && closeModal()}
      >
        <div
          class="modal-content relative top-10 mx-auto p-6 border w-[32rem] shadow-xl rounded-xl bg-white transform transition-all duration-300 ease-in-out scale-95 opacity-0"
        >
          <div class="mt-2">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">Nouvelle tâche</h3>
            {errorMessage() && (
              <div class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {errorMessage()}
              </div>
            )}
            <form onSubmit={handleSubmit} class="space-y-5">
              <input type="hidden" name="createdBy" value={formData().createdBy} />
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  name="title"
                  value={formData().title}
                  onInput={handleInputChange}
                  required
                  class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="Entrez le titre de la tâche..."
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData().description}
                  onInput={handleInputChange}
                  rows={4}
                  class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm resize-none"
                  placeholder="Décrivez la tâche en détail..."
                />
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Priorité</label>
                  <select
                    name="priority"
                    value={formData().priority}
                    onInput={handleInputChange}
                    class="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Statut</label>
                  <select
                    name="status"
                    value={formData().status}
                    onInput={handleInputChange}
                    class="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
                  >
                    {/* <option value="not_started">Non commencée</option> */}
                    <option value="in_progress">En cours</option>
                    <option value="waiting">En attente</option>
                    <option value="completed">Terminée</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Heures estimées</label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData().estimatedHours}
                    onInput={handleInputChange}
                    min="0"
                    step="0.5"
                    class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    placeholder="0"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Heures réelles</label>
                  <input
                    type="number"
                    name="actualHours"
                    value={formData().actualHours}
                    onInput={handleInputChange}
                    min="0"
                    step="0.5"
                    class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Étiquettes</label>
                <input
                  type="text"
                  name="labels"
                  value={formData().labels}
                  onInput={handleInputChange}
                  class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="Séparez les étiquettes par des virgules..."
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Progression (%)</label>
                <input
                  type="range"
                  name="progress"
                  value={formData().progress}
                  onInput={handleInputChange}
                  min="0"
                  max="100"
                  step="5"
                  class="mt-1 block w-full"
                />
                <div class="text-sm text-gray-500 text-right">{progressDisplay()}</div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    id="isRecurring"
                    checked={formData().isRecurring}
                    onChange={handleInputChange}
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <label for="isRecurring" class="text-sm font-medium text-gray-700">
                    Tâche récurrente
                  </label>
                </div>

                <div class={`recurringOptions ${!formData().isRecurring ? 'hidden' : ''} space-y-2`}>
                  <label class="block text-sm font-medium text-gray-700">Pattern de récurrence</label>
                  <select
                    name="recurringPattern"
                    value={formData().recurringPattern}
                    onInput={handleInputChange}
                    class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
                  >
                    <option value="daily">Quotidien</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                    <option value="yearly">Annuel</option>
                  </select>
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Date d'échéance</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData().dueDate}
                  onInput={handleInputChange}
                  class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Assigné à</label>
                <select
                  name="assignedTo"
                  value={formData().assignedTo}
                  onInput={handleInputChange}
                  class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
                >
                  {users.map((user: any) => (
                    <option value={user.id}>{user.fullName}</option>
                  ))}
                </select>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Projet</label>
                <select
                  name="projectId"
                  value={formData().projectId}
                  onInput={handleInputChange}
                  required
                  class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
                >
                  {projects.map((project: any) => (
                    <option value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div class="flex justify-end space-x-4 pt-4 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  class="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  class="relative min-w-[120px] px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading()}
                >
                  {isLoading() ? "Loading..." : "Créer la tâche"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Show >
  );
}
