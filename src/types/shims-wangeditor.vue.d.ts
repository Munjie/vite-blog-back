// 解决src/views/pages/editor.vue:24:33 - error TS7016: Could not find a declaration file for module '@wangeditor/editor-for-vue'. 'C:/blog_app/vite-blog-back/node_modules/@wangeditor/editor-for-vue/dist/index.esm.js' implicitly has an 'any' type. There are types at 'C:/blog_app/vite-blog-back/node_modules/@wangeditor/editor-for-vue/dist/src/index.d.ts', but this result could not be resolved when respecting package.json "exports". The '@wangeditor/editor-for-vue' library may need to update its package.json or typings. 24 import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

declare module '@wangeditor/editor-for-vue' {
    import type { DefineComponent } from 'vue';

    export const Editor: DefineComponent<any, any, any>;
    export const Toolbar: DefineComponent<any, any, any>;
}
