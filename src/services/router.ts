import { createRouter, createWebHistory, type RouteLocationNormalized } from "vue-router";
import { useAuth } from "../composables/useAuth";
import Login from "../pages/Login.vue";
import Landing from "../pages/Landing.vue";
import Signup from "../pages/Signup.vue";
import FeedView from "../pages/FeedView.vue";
import TaskDetailView from "../pages/TaskDetailView.vue";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    guestOnly?: boolean;
  }
}

const routes = [
  { path: "/", component: Landing },
  { path: "/auth/login", component: Login, meta: { guestOnly: true } },
  { path: "/auth/signup", component: Signup, meta: { guestOnly: true } },
  { path: "/feed", component: FeedView, meta: { requiresAuth: true } },
  { path: "/tasks/:id", component: TaskDetailView, meta: { requiresAuth: true } },
  // Legacy route from the first build; the feed owns browsing now.
  { path: "/tasks", redirect: "/feed" },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to: RouteLocationNormalized) => {
  const auth = useAuth();
  if (!auth.ready.value) await auth.init();

  if (to.meta.requiresAuth && !auth.isAuthed.value) {
    return { path: "/auth/login", query: { redirect: to.fullPath } };
  }
  if (to.meta.guestOnly && auth.isAuthed.value) {
    const redirect = typeof to.query.redirect === "string" ? to.query.redirect : "/feed";
    return { path: redirect };
  }
  return true;
});
