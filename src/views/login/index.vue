<template>
    <div class="login-bg">
        <div class="login-container">
            <div class="login-header">
                <img class="logo mr10" src="../../assets/img/login-index.svg" alt="" />
                <div class="login-title">AI Cloud System</div>
            </div>
            <el-form :model="form" :rules="rules" ref="loginFormRef" size="large">
                <el-form-item prop="username">
                    <el-input v-model="form.username" placeholder="User">
                        <template #prepend>
                            <el-icon>
                                <User />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        type="password"
                        placeholder="Password"
                        v-model="form.password"
                        @keyup.enter="handleLogin"
                    >
                        <template #prepend>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <div class="pwd-tips">
                    <el-checkbox class="pwd-checkbox" v-model="checked" label="Remember" />
                    <el-link type="primary" @click="router.push('/reset-pwd')">Forgot</el-link>
                </div>
                <el-button class="login-btn" type="primary" size="large" @click="handleLogin">Login</el-button>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, reactive} from 'vue';
import {useRouter} from 'vue-router';
import type {FormRules} from 'element-plus';
import {login} from '../../api/login.ts'

const lgStr = localStorage.getItem('login-param');
const checked = ref(lgStr ? true : false);
import { useUserStore } from '../../stores';
import {getUserMenu} from "../../api/menu.ts";

import { useTabsStore } from '../../stores/tabs';
import { usePermissStore } from '../../stores/permiss';
import type {Menus} from "../../types/menu.ts";
const router = useRouter();
const loading = ref(false);
const form = reactive({
    username: '',
    password: ''
});
const menus = ref<Menus[]>([]);
const rules: FormRules = {
    username: [
        {required: true, message: '请输入用户名', trigger: 'blur'}
    ],
    password: [
        {required: true, message: '请输入密码', trigger: 'blur'}
    ]
};
const store = useUserStore();
const permiss = usePermissStore();
const handleLogin = async () => {
    if (!form.username || !form.password) return;

    try {
        loading.value = true;
        const res = await login(form);
        if (res.code === 200) {
            //
            localStorage.setItem('vuems_name', form.username);
            const keys = permiss.defaultList[form.username == 'admin' ? 'admin' : 'user'];
            permiss.handleSet(keys || []);
            //
            store.setUsername(res.data.username);
            store.setUserid(res.data.id)
            store.setToken(res.data.token)
            menus.value  = await getUserMenu(res.data.id);
            store.setMenus(menus.value);
            await router.push('/main');

        }
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};
const tabs = useTabsStore();
tabs.clearTabs();

</script>

<style scoped>
.login-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    background: url(../../assets/img/bg_login.jpg) center/cover no-repeat;
}

.login-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
}

.logo {
    width: 35px;
}

.login-title {
    font-size: 22px;
    color: #333;
    font-weight: bold;
}

.login-container {
    width: 450px;
    border-radius: 5px;
    background: #fff;
    padding: 40px 50px 50px;
    box-sizing: border-box;
}

.pwd-tips {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    margin: -10px 0 10px;
    color: #787878;
}

.pwd-checkbox {
    height: auto;
}

.login-btn {
    display: block;
    width: 100%;
}

.login-tips {
    font-size: 12px;
    color: #999;
}

.login-text {
    display: flex;
    align-items: center;
    margin-top: 20px;
    font-size: 14px;
    color: #787878;
}
</style>
