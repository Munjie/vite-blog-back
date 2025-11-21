<script setup lang="ts">
import {ref, reactive} from 'vue';
import {useRouter} from 'vue-router';
import type {FormRules} from 'element-plus';
import {login} from '../../api/login.ts'

const router = useRouter();
const loading = ref(false);
const form = reactive({
    username: '',
    password: '',
    remember: false
});
const rules: FormRules = {
    username: [
        {required: true, message: '请输入用户名', trigger: 'blur'}
    ],
    password: [
        {required: true, message: '请输入密码', trigger: 'blur'}
    ]
};
const handleLogin = async () => {
    if (!form.username || !form.password) return;

    try {
        loading.value = true;
        // 模拟API请求
        const res = await login(form);
        debugger
        if (res.code === 200) {
            localStorage.setItem('token', res.data.token);
            await router.push('/main'); // 登录成功跳转
        }
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="login-container">
        <el-card class="box-card">
            <template #header>
                <span>登录</span>
            </template>
            <el-form :model="form" :rules="rules" ref="loginFormRef" label-width="100px" class="demo-loginForm">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input type="password" v-model="form.password" show-password></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleLogin">登录</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<style scoped>

</style>