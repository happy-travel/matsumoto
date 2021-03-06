import { windowSessionStorage } from "../misc/window-storage";

const TRACKING_KEY = "_lastVisitedPage",
      AUTH_PATH = "/auth/",
      EXCLUDED_PATHS = [AUTH_PATH, "/signup", "/logout"],
      authRoutes = () => window.location.href.includes(AUTH_PATH),
      routeThatCanBeLastVisited = () => EXCLUDED_PATHS.every(item => !window.location.href.includes(item));

export const lastPage = () => windowSessionStorage.get(TRACKING_KEY) || "/";

export default () => {
    if (authRoutes()) return;

    windowSessionStorage.set(
        TRACKING_KEY,
        routeThatCanBeLastVisited()
            ? window.location.pathname + window.location.search
            : "/"
    );
};
