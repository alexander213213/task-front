import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Login.vue";
import Landing from "../pages/Landing.vue";
import Signup from "../pages/Signup.vue";
import Tasks from "../pages/Tasks.vue";

const routes = [
    {path: "/", component: Landing},
    {path: "/auth/login", component: Login},
    {path: "/auth/signup", component: Signup},
    {path: "/tasks", component: Tasks},

]

export const router = createRouter({
    history: createWebHistory(),
    routes
})