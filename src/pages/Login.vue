<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { api } from '../services/api';
import { useRouter } from 'vue-router';

export type UserData = {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    ratingAvg: number;
    ratingCount: number;
}

const props = defineProps<{
    setUser: (user: UserData) => void,
    user: UserData | null
}>()


const router = useRouter()

const formRef = ref<FormInst | null>(null)
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const loading = ref(false)
const message = useMessage()

const formModel = ref({
    identifier: "",
    password: ""
})

if (props.user) {
    router.push("/tasks")
}

const rules: FormRules = {
    identifier: [
        { required: true, message: "Username or email is required", trigger: "blur" },
        {
            validator: (_, value: string) => {
                if (!value) return true
                const isEmail = emailRegex.test(value)
                const isUsername = usernameRegex.test(value)

                if (!isEmail && !isUsername) {
                    return new Error("Enter valid email or username (3-20 chars, underscore, numbers)")
                }
                return true

            },
            trigger: ["blur", "input"]
        }
    ],
    password: [
        { required: true, message: "Password is required", trigger: "blur" },
        { min: 8, message: "Minimum of 8 characters", trigger: ["blur", "input"] }
    ]
}

const canSubmit = computed(() => {
    return formModel.value.identifier.trim().length > 0 && formModel.value.password.length > 0 && !loading.value
})

const isEmail = computed(() => {
    return emailRegex.test(formModel.value.identifier)
})

async function onSubmit() {
    if (!formRef.value) return

    try {
        await formRef.value.validate()
    } catch {
        return
    }

    try {
        loading.value = true

        const payload = isEmail.value
            ? { email: formModel.value.identifier, password: formModel.value.password }
            : { username: formModel.value.identifier, password: formModel.value.password }

        const {user} = await api.post<{ ok: boolean; message?: string; user?: UserData }>(
            "/auth/login",
            payload
        )
        props.setUser(user!)
        message.success("Login successful")
        router.push("/tasks")
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
                    Welcome Back
                </n-h2>
                <n-text depth="3">
                    Sign in to continue
                </n-text>
            </div>
            <n-form ref="formRef" :model="formModel" label-width="80" label-placement="top" :rules="rules"
                @submit.prevent="onSubmit">
                <n-form-item label="Username or Email" path="identifier">
                    <n-input v-model:value="formModel.identifier" clearable placeholder="Username or Email" />
                </n-form-item>

                <n-form-item label="Password" path="password">
                    <n-input v-model:value="formModel.password" type="password" show-password-on="click"
                        placeholder="Password" />
                </n-form-item>
                <n-button type="primary" block :loading="loading" :disabled="!canSubmit" attr-type="submit">
                    Login
                </n-button>
                <n-divider></n-divider>
                <div class="footer">
                    <n-text depth="3">Don't have an account?</n-text>
                    <n-button text type="primary" @click="router.push('/auth/signup')">
                        Create one
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