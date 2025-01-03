import { Users } from "lucide-solid";


export default function ActiveUsers(props: any) {
  const activeUsersCount = props.users.filter((user: any) => user.isActive).length;

  return (
    <div class="bg-white rounded-2xl shadow-md shadow-indigo-100/50 p-6 border border-indigo-50 hover:shadow-xl transition-shadow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-indigo-600 mb-1">Membres actifs</p>
          <p class="text-3xl font-bold text-gray-900">{activeUsersCount || 0}</p>
        </div>
        <div class="bg-gradient-to-br from-indigo-100 to-indigo-200 p-3.5 rounded-xl">
          <Users class="w-7 h-7 text-indigo-600" />
        </div>
      </div>
    </div>
  );
}
