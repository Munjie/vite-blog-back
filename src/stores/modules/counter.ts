import { defineStore } from 'pinia'
import {computed, ref} from "vue";

export const useCounterStore = defineStore('counter', () => {
    /**
     * ref() 就是 state 属性
     * computed() 就是 getters
     * function() 就是 actions，action中可以使用异步函数
     */
        //state:
    const count = ref(0)
    //getter:
    const getCount = computed<number>(() => {
        return count.value
    })
    //actions:
    const increment = () => {
        count.value++
    }
    //暴露state、computed、actions；否则无法使用
    return { count, getCount, increment }
})
