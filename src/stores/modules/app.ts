import { defineStore } from 'pinia';
import { ref } from 'vue';



export const useAppStore = defineStore(
    'app',
    () => {
        const sidebarOpen = ref(true);
        const isDark = ref(false);

        const toggleSidebar = () => {
            sidebarOpen.value = !sidebarOpen.value;
        };
        const toggleTheme = (dark: boolean) => {
            isDark.value = dark;
            if (dark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };


        return {
            sidebarOpen,
            isDark,
            isCollapse: false,
            toggleSidebar,
            toggleTheme,
            tabs: [
                {
                    path: "/home",
                    index: "Home",
                    label: "home",
                    icon: "home"
                }
            ],
        };
    },
    {
        persist: {
            key: 'admin-app-config',
        }
    }
);