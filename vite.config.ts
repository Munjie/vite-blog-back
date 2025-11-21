import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";
import viteCompression from 'vite-plugin-compression'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vite.dev/config/
export default defineConfig((mode): any =>{
    const env = loadEnv(mode.mode, process.cwd());
    return {
        server: {
            host: "0.0.0.0",
            open: true,
            port: +env.VITE_APP_PORT,
            cors: true,
            proxy: {
                [env.VITE_APP_BASE_API]: {
                    changeOrigin: true,
                    target: env.VITE_APP_API_URL,
                    rewrite: (path: any) =>
                        path.replace(new RegExp("^" + env.VITE_APP_BASE_API), ""),
                },
            },
        },
        plugins: [
            vue(),
            vueSetupExtend(),
            createSvgIconsPlugin({
                // 图标存放的地址
                iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
                symbolId: 'icon-[dir]-[name]',
                svgoOptions: {
                    // 解决svg图标不显示的问题
                    plugins: [
                        {
                            name: 'removeAttrs',
                            active: true,
                            params: {elemSeparator: ',', attrs: []}
                        }
                    ]
                }
            }),
            /** element plus 自动按需导入插件配置 start */
            AutoImport({
                resolvers: [ElementPlusResolver()],
            }),
            Components({
                resolvers: [ElementPlusResolver({importStyle: 'sass'})] // importStyle: "sass" ---  解决覆盖element plus 的sass变量不生效的bug
            }),
            /** element plus 自动按需导入插件配置 end */
            // 压缩
            viteCompression({
                algorithm: 'gzip', // 使用 gzip 压缩
                ext: '.gz', // 生成的文件扩展名
                threshold: 20240, // 仅压缩大于 10KB 的文件
                deleteOriginFile: false, // 是否删除原始文件
                compressionOptions: { level: 9 }, // 压缩级别，1-9，越高压缩率越大
            }),

        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
            }
        },
        css: {
            preprocessorOptions: {
                // scss全局文件引入
                scss: {
                    // additionalData: '@import "@/styles/global.scss";' 这行代码可能会导致报错
                    additionalData: '@use "@/styles/global.scss" as *;' //建议使用这行代码
                },
            },
        },
        build: {
            minify: 'terser',
            // 清除所有console和debugger
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true
                }
            }
        }
    }
})
