import {useQuery} from "@tanstack/react-query";
import api from "../../../../shared/lib/api";

export function useNotificationSettingsQuery(options = {}) {
    return useQuery({
        queryKey: ["notification-settings"],
        queryFn: async () => {
            const res = await api.get("/api/users/me/notification-settings");
            return res.data; // { pushNotificationEnabled, marketingAgreed }
        },
        ...options,
    });
}
