import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";
import viteCompression from 'vite-plugin-compression'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import UnoCSS from 'unocss/vite'
// https://vite.dev/config/

const pathSrc = path.resolve(__dirname, "src");
export default defineConfig((mode): any =>{
    const env = loadEnv(mode.mode, process.cwd());
    return {
        base: "./",
        root: process.cwd(), // 绝对路径
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
                resolvers: [
                    ElementPlusResolver(),
                    IconsResolver({}),
                ],
                vueTemplate: true, // 是否在 vue 模板中自动导入
                dts: path.resolve(pathSrc, 'types', 'auto-imports.d.ts') // 自动导入组件类型声明文件位置，默认根目录
            }),
            Components({
                resolvers: [
                    // importStyle: "sass" ---  解决覆盖element plus 的sass变量不生效的bug
                    ElementPlusResolver({importStyle: 'sass'}),
                    // 自动注册图标组件
                    IconsResolver({
                        enabledCollections: ["ep"] // element-plus图标库，其他图标库 https://icon-sets.iconify.design/
                    }),
                ],
                dts: path.resolve(pathSrc, "types", "components.d.ts"), //  自动导入组件类型声明文件位置，默认根目录

            }),
            Icons({
                // 自动安装图标库
                autoInstall: true,
            }),
            createSvgIconsPlugin({
                // 指定需要缓存的图标文件夹
                iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
                // 指定symbolId格式
                symbolId: 'icon-[dir]-[name]',
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
            UnoCSS({ /* options */ }),

        ],
        resolve: {
            alias: {
                "@": pathSrc,
            }
        },
        css: {
            // CSS 预处理器
            preprocessorOptions: {
                //define global scss variable
                scss: {
                    javascriptEnabled: true,
                    additionalData: `@use "@/styles/variables.scss" as *;`
                }
            }
        },
        build: {
            minify: 'terser',
            // 清除所有console和debugger
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true
                }
            },
            rollupOptions: {
                // 直接告诉 rollup 忽略类型检查
                onwarn(warning:any, handler:any) {
                    if (warning.code === 'TS7016' && warning.message.includes('@wangeditor')) {
                        return
                    }
                    handler(warning)
                }
            }
        }
    }
})
