import { createRouter, createWebHistory, type RouteLocationNormalized } from "vue-router";
import { useAuth } from "../composables/useAuth";
import Login from "../pages/Login.vue";
import Landing from "../pages/Landing.vue";
import Signup from "../pages/Signup.vue";
import Tasks from "../pages/Tasks.vue";

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
  // Legacy feed route; F3 splits this into /feed, /tasks/:id, /my-tasks, /assigned.
  { path: "/tasks", component: Tasks, meta: { requiresAuth: true } },
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
    const redirect = typeof to.query.redirect === "string" ? to.query.redirect : "/tasks";
    return { path: redirect };
  }
  return true;
});
