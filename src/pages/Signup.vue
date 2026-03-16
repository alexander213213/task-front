<script setup lang="ts">
import { useMessage, type FormInst, type FormRules } from "naive-ui"
import { api } from "../services/api";
import { computed, ref } from "vue";
import { withQuery } from "../utils/query";
import { useRouter } from "vue-router";
import type { UserData } from "./Login.vue";


type ExistsResponse = { ok: boolean, exists: boolean }

const formRef = ref<FormInst | null>(null)
const formModel = ref({
    username: "",
    email: "",
    firstName: "",
    middleName: "",
    lastName: "",
    password: "",
    confirmPassword: ""
})

const props = defineProps<{
    user: UserData | null
}>()


const loading = ref<boolean>(false)

const router = useRouter()
const message = useMessage()


const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const existCache = new Map<string, boolean>()

if (props.user) {
    router.push("/tasks")
}

async function existsByQuery(query: { username: string } | { email: string }) {
    let key: string
    if ("email" in query) {
        key = `e:${query.email}`
    } else {
        key = `u:${query.username}`
    }

    if (existCache.has(key)) { return { exists: existCache.get(key) } }

    const path = withQuery("/auth/exist", query)

    const res = await api.get<ExistsResponse>(path)
    existCache.set(key, res.exists)

    return res
}

const canSubmit = computed(() => {
    const hasEmail = formModel.value.email.trim().length > 0
    const hasPassword = formModel.value.password.length > 0
    const notLoading = !loading.value
    const hasFirstName = formModel.value.firstName.trim().length > 0
    const hasLastName = formModel.value.lastName.trim().length > 0

    return hasEmail && hasPassword && notLoading && hasFirstName && hasLastName
})

const rules: FormRules = {
    username: [
        { required: true, message: "Username required", trigger: "blur" },
        {
            validator: (_, value: string) => {
                if (!value) return true
                if (!usernameRegex.test(value)) return new Error("3-20 chars, letters/numbers/underscore only")
                return true
            }, trigger: ["blur", "input"]
        },
        {
            asyncValidator: async (_, v: string) => {
                const value = v.trim()
                if (!value) return Promise.resolve()
                if (!usernameRegex.test(value)) return Promise.resolve()

                try {
                    const { exists } = await existsByQuery({ username: value })
                    if (exists) return Promise.reject("Username already exist")
                    return Promise.resolve()
                } catch {
                    return Promise.resolve()
                }
            }, trigger: "blur"
        }
    ],
    email: [
        { required: true, message: "Email required", trigger: "blur" },
        {
            validator: (_, value: string) => {
                if (!value) return true
                if (!emailRegex.test(value)) return new Error("Must be a valid email")
                return true
            }, trigger: ["blur", "input"]
        },
        {
            asyncValidator: async (_, v: string) => {
                const value = v.trim()
                if (!value) return Promise.resolve()
                if (!emailRegex.test(value)) return Promise.resolve()

                try {
                    const { exists } = await existsByQuery({ email: value })
                    if (exists) return Promise.reject("Email already in use")
                    return Promise.resolve()
                } catch {
                    return Promise.resolve()
                }
            }, trigger: "blur"
        }
    ],
    firstName: [
        { required: true, message: "First name is required", trigger: "blur" },
        { min: 1, message: "Must enter first name", trigger: "blur" }
    ],
    lastName: [
        { required: true, message: "First name is required", trigger: "blur" },
        { min: 1, message: "Must enter first name", trigger: "blur" }
    ],
    password: [
        { required: true, message: "Password is required", trigger: "blur" },
        { min: 8, message: "Minimum of 8 characters", trigger: ["blur", "input"] }
    ],
    confirmPassword: [
        { required: true, message: "Must confirm password", trigger: "blur" },
        { min: 8, message: "Minimum of 8 characters", trigger: ["blur", "input"] },
        {
            validator: (_, v: string) => {
                const value = v.trim()
                if (!value) return true
                if (value.length < 8) return true

                if (value !== formModel.value.password) return new Error("Does not match your password")
                return true
            }, trigger: ['blur', 'input']
        }
    ]
}

async function onSubmit() {
    if (!formRef.value) return

    try {
        await formRef.value.validate()
    } catch {
        return
    }

    try {
        loading.value = true
        const { middleName, ...rest } = formModel.value
        const payload = middleName?.trim()
            ? { ...rest, middleName: middleName.trim() }
            : rest

        await api.post<{ ok: boolean; message?: string; user?: object }>(
            "/auth/register",
            payload
        )

       
        message.success("Registration successful")
        
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Request failed"
        message.error(msg)
    } finally {
        loading.value = false
    }
}
</script>


<template>
    <div class="page">
        <n-card class="card">
            <div class="header">
                <n-h2>
                    Welcome
                </n-h2>
                <n-text depth="3">
                    Enter your details to register
                </n-text>
            </div>
            <n-form ref="formRef" :model="formModel" label-width="80" label-placement="top" :rules="rules"
                @submit.prevent="onSubmit">
                <n-form-item label="Username" path="username">
                    <n-input v-model:value="formModel.username" clearable placeholder="Username" />
                </n-form-item>
                <n-form-item label="Email" path="email">
                    <n-input v-model:value="formModel.email" clearable placeholder="Email" />
                </n-form-item>
                <n-form-item label="First Name" path="firstName">
                    <n-input v-model:value="formModel.firstName" clearable placeholder="First Name" />
                </n-form-item>
                <n-form-item label="Middle Name" path="middleName">
                    <n-input v-model:value="formModel.middleName" clearable placeholder="Middle Name" />
                </n-form-item>
                <n-form-item label="Last Name" path="lastName">
                    <n-input v-model:value="formModel.lastName" clearable placeholder="Last Name" />
                </n-form-item>
                <n-form-item label="Password" path="password">
                    <n-input v-model:value="formModel.password" type="password" show-password-on="click"
                        placeholder="Password" />
                </n-form-item>
                <n-form-item label="Confirm Password" path="confirmPassword">
                    <n-input v-model:value="formModel.confirmPassword" type="password" show-password-on="click"
                        placeholder="Confirm Password" />
                </n-form-item>
                <n-button type="primary" block :loading="loading" :disabled="!canSubmit" attr-type="submit">
                    Sign-up
                </n-button>
                <n-divider></n-divider>
                <div class="footer">
                    <n-text depth="3">Already have an account?</n-text>
                    <n-button text type="primary" @click="router.push('/auth/login')">
                        Sign-in
                    </n-button>
                </div>
            </n-form>
        </n-card>
    </div>
</template>

<style scoped>
.page {
    display: grid;
    place-items: center;
    min-height: 80vh;
    padding: 24px;
}

.card {
    width: 100%;
    max-width: 400px;
    min-width: min(400px, 100vw);
}

.header {
    display: grid;
    margin-bottom: 24px;
}

.footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
}
</style>