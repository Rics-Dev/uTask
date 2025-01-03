import { Users } from "lucide-solid";


export default function ActiveUsers(props: any) {
  const activeUsersCount = props.users.filter((user: any) => user.isActive).length;

  return (
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Membres actifs</p>
          <p class="text-2xl font-bold text-gray-900">{activeUsersCount || 0}</p>
        </div>
        <div class="bg-purple-100 p-3 rounded-lg">
          <Users class="w-6 h-6 text-purple-600" />
        </div>
      </div>
    </div>
  );
}
