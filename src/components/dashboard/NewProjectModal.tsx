import { createEffect, createSignal, Show } from "solid-js";
import { actions } from 'astro:actions';
import { addNanoProject, isNewProjectOpen } from "../../stores/projectsStore";
import { useStore } from "@nanostores/solid";

export default function NewProjectModal({ user, users }: { user: any, users: any }) {
  const $isNewProjectOpen = useStore(isNewProjectOpen);

  const [isVisible, setIsVisible] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const [formData, setFormData] = createSignal({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    projectManager: "",
    members: [] as string[],
    status: "planning",
    priority: "medium",
    orgId: user.orgId,
    createdBy: user.userId,
  });

  createEffect(() => {
    if ($isNewProjectOpen()) {
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
    if (type === "checkbox") {
      const members = [...formData().members];
      if (checked) {
        members.push(value);
      } else {
        const index = members.indexOf(value);
        if (index > -1) members.splice(index, 1);
      }
      setFormData({ ...formData(), members });
    } else {
      setFormData({ ...formData(), [name]: value });
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
      console.log('Form data:', data);

      // Ensure all values are properly converted to strings
      Object.entries(data).forEach(([key, value]) => {
        // Handle empty numeric values
        if (typeof value === 'number' && !Number.isFinite(value)) {
          formDataObj.append(key, '0');
        } else if (typeof value === 'boolean') {
          formDataObj.append(key, value.toString());
        } else if (value === null || value === undefined) {
          formDataObj.append(key, '');
        } else if (Array.isArray(value)) {
          // Handle array values (if needed, you may need to stringify or send individual items)
          value.forEach(item => formDataObj.append(key, item));
        } else {
          formDataObj.append(key, value.toString());
        }
      });

      // Log FormData contents
      for (let [key, value] of formDataObj.entries()) {
        console.log(`${key}: ${value}`);
      }
      const { data: responseData, error } = await actions.addProject(formDataObj);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (responseData) {
        addNanoProject(responseData.project);
        // Reset form and show success message
        setFormData({
          title: "",
          description: "",
          startDate: "",
          endDate: "",
          projectManager: "",
          members: [] as string[],
          status: "planning",
          priority: "medium",
          orgId: user.orgId,
          createdBy: user.userId,
        });
        setErrorMessage(null);
        showToast("Projet ajoutée avec succès!");
        closeModal();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setErrorMessage("Une erreur est survenue lors de la création du projet");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    isNewProjectOpen.set(false);
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      projectManager: "",
      members: [] as string[],
      status: "planning",
      priority: "medium",
      orgId: user.orgId,
      createdBy: user.userId,
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
            <h3 class="text-xl font-semibold text-gray-900 mb-6">Nouveau projet</h3>
            {errorMessage() && (
              <div class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {errorMessage()}
              </div>
            )}
            <form onSubmit={handleSubmit} class="space-y-5">
              <input type="hidden" name="createdBy" value={formData().createdBy} />
              <input type="hidden" name="orgId" value={formData().orgId} />
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700"
                >Titre du projet</label
                >
                <input
                  type="text"
                  name="title"
                  value={formData().title}
                  onInput={handleInputChange}
                  required
                  class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                  placeholder="Entrez le titre du projet..."
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700"
                >Description</label
                >
                <textarea
                  value={formData().description}
                  onInput={handleInputChange}
                  name="description"
                  rows="4"
                  class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm resize-none"
                  placeholder="Décrivez les objectifs et la portée du projet..."
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700"
                  >Date de début</label
                  >
                  <input
                    type="date"
                    name="startDate"
                    value={formData().startDate}
                    onInput={handleInputChange}
                    required
                    class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                  />
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700"
                  >Date de fin prévue</label
                  >
                  <input
                    type="date"
                    name="endDate"
                    value={formData().endDate}
                    onInput={handleInputChange}
                    required
                    class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700"
                >Responsable du projet</label
                >
                <select
                  name="projectManager"
                  required
                  value={formData().projectManager}
                  onInput={handleInputChange}
                  class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm bg-white"
                >
                  <option value="">Sélectionnez un responsable</option>
                  {
                    users.map((user: any) => (
                      <option value={user.id}>{user.fullName}</option>
                    ))
                  }
                </select>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700"
                >Membres du projet</label
                >
                <div class="mt-1 border border-gray-300 rounded-lg">
                  <div class="p-3 max-h-48 overflow-y-auto">
                    {
                      users.map((user: any) => (
                        <label class="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            name="members"
                            value={user.id}
                            onInput={handleInputChange}
                            class="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                          />
                          <span class="ml-3 text-sm text-gray-700">
                            {user.fullName}
                          </span>
                        </label>
                      ))
                    }
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700"
                  >Statut initial</label
                  >
                  <select
                    name="status"
                    value={formData().status}
                    onInput={handleInputChange}
                    class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm bg-white"
                  >
                    <option value="planning">En planification</option>
                    <option value="active">Actif</option>
                    <option value="on_hold">En attente</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700"
                  >Priorité</label
                  >
                  <select
                    name="priority"
                    value={formData().priority}
                    onInput={handleInputChange}
                    class="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm bg-white"
                  >
                    <option value="low">Basse</option>
                    <option value="medium" selected>Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>
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
                  disabled={isLoading()}
                  class="relative min-w-[120px] px-6 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {isLoading() ? "Loading..." : "Créer le projet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Show>
  );
}
