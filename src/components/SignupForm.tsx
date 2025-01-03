import { createSignal, Show, For } from 'solid-js';
import { ChevronLeft } from 'lucide-solid';
import { actions } from 'astro:actions';

type FormData = {
  fullName: string;
  email: string;
  companyName: string;
  password: string;
  confirmPassword: string;
};

type InputErrors = Record<keyof FormData, string[]>;

export default function SignupForm() {
  const [currentStep, setCurrentStep] = createSignal(1);
  const [loading, setLoading] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);
  const [inputErrors, setInputErrors] = createSignal<InputErrors>({
    fullName: [],
    email: [],
    companyName: [],
    password: [],
    confirmPassword: []
  });
  const [formData, setFormData] = createSignal<FormData>({
    fullName: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setFormData(prev => ({ ...prev, [target.name]: target.value }));

    // Clear error when user starts typing
    if (inputErrors()[target.name as keyof FormData]?.length) {
      setInputErrors(prev => ({ ...prev, [target.name]: [] }));
    }
  };

  const validateField = (name: keyof FormData, value: string): string[] => {
    const errors: string[] = [];
    if (!value.trim()) {
      errors.push('Ce champ est requis.');
    }
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push("Veuillez entrer un email valide.");
    }
    if (name === 'password' && value.length < 8) {
      errors.push("Le mot de passe doit comporter au moins 8 caractères.");
    }
    return errors;
  };

  const validateStep = (): boolean => {
    const stepInputs = document.querySelectorAll(`[data-step="${currentStep()}"] input`);
    const newErrors: Partial<InputErrors> = {};
    let isValid = true;

    stepInputs.forEach((input) => {
      const { name, value } = input as HTMLInputElement;
      const fieldErrors = validateField(name as keyof FormData, value);
      if (fieldErrors.length > 0) {
        newErrors[name as keyof FormData] = fieldErrors;
        isValid = false;
      }
    });

    if (currentStep() === 3) {
      const { password, confirmPassword } = formData();
      if (password !== confirmPassword) {
        newErrors.confirmPassword = ['Les mots de passe ne correspondent pas.'];
        isValid = false;
      }
    }

    setInputErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };



  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const formDataObj = new FormData();
      Object.entries(formData()).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });

      const { data: responseData, error } = await actions.signup(formDataObj);

      if (error) {
        console.error(error);
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (responseData) {
        setErrorMessage(null);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Une erreur inattendue s'est produite.");
      setLoading(false);

    }
  };
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep() !== 3) {
      e.preventDefault();
      if (validateStep()) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };
  const InputField = (props: {
    name: keyof FormData,
    label: string,
    type?: string
  }) => (
    <div>
      <label for={props.name} class="block text-sm font-medium text-gray-700 mb-1">
        {props.label}
      </label>
      <input
        type={props.type || 'text'}
        id={props.name}
        name={props.name}
        value={formData()[props.name]}
        onInput={handleInputChange}
        class={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${inputErrors()[props.name]?.length ? 'border-red-300' : 'border-gray-300'
          }`}
        required
      />
      <Show when={inputErrors()[props.name]?.length}>
        <p class="mt-1 text-sm text-red-600">{inputErrors()[props.name].join(', ')}</p>
      </Show>
    </div>
  );

  const StepContent = () => (
    <Show when={errorMessage()}>
      <div class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        {errorMessage()}
      </div>
    </Show>
  );

  return (
    <div class="w-full max-w-md">
      <div class="mb-8">
        <a href="/" class="flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ChevronLeft class="w-5 h-5 mr-1" />
          Retour
        </a>
        <h1 class="text-4xl font-extrabold mb-2 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
          Créer un compte
        </h1>
        <p class="text-lg text-gray-600">
          Commencez à optimiser votre productivité aujourd'hui
        </p>
      </div>

      <div class="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
        <div class="mb-6 flex justify-between">
          <For each={[1, 2, 3]}>
            {(i) => (
              <div class="flex items-center">
                <div class={`w-8 h-8 rounded-full flex items-center justify-center
                  ${i <= currentStep() ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {i}
                </div>
                <Show when={i < 3}>
                  <div class={`w-12 h-1 mx-2 
                    ${i < currentStep() ? 'bg-blue-600' : 'bg-gray-200'}`} />
                </Show>
              </div>
            )}
          </For>
        </div>

        <form onSubmit={handleSubmit} onKeyPress={handleKeyPress} class="space-y-6">
          <StepContent />

          <Show when={currentStep() === 1}>
            <div data-step="1" class="space-y-6">
              <h2 class="text-2xl font-bold mb-4">Informations personnelles</h2>
              <InputField name="fullName" label="Nom complet" />
              <InputField name="email" label="Email professionnel" type="email" />
            </div>
          </Show>

          <Show when={currentStep() === 2}>
            <div data-step="2">
              <h2 class="text-2xl font-bold mb-4">Informations de l'entreprise</h2>
              <InputField name="companyName" label="Nom de l'entreprise" />
            </div>
          </Show>

          <Show when={currentStep() === 3}>
            <div data-step="3" class="space-y-6">
              <h2 class="text-2xl font-bold mb-4">Sécurité</h2>
              <InputField name="password" label="Mot de passe" type="password" />
              <InputField name="confirmPassword" label="Confirmer le mot de passe" type="password" />
            </div>
          </Show>

          <div class="flex justify-between mt-6 w-full gap-4">
            <Show when={currentStep() > 1}>
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                class="flex-shrink-0 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Précédent
              </button>
            </Show>

            <Show when={currentStep() < 3}>
              <button
                type="button"
                onClick={() => validateStep() && setCurrentStep(prev => prev + 1)}
                class="flex-shrink-0 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto"
              >
                Suivant
              </button>
            </Show>

            <Show when={currentStep() === 3}>
              <button
                type="submit"
                class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
               font-medium transition-all duration-300 
               disabled:opacity-50 disabled:cursor-not-allowed
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading()}
              >
                {loading() ? 'Chargement...' : 'Créer mon compte'}
              </button>
            </Show>
          </div>
        </form>

        <p class="mt-6 text-center text-gray-600">
          Vous avez déjà un compte?{' '}
          <a href="/login" class="text-blue-600 hover:text-blue-700 font-medium">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
