<template>
    <footer
        class="footer-container"
        :style="{
      backgroundColor,
      color: textColor,
      padding,
      textAlign: alignment
    }"
        :class="{ 'hide-on-mobile': hideOnMobile }"
    >
        <div class="footer-content">
            <span class="footer-text">{{ text }}</span>
            <nav class="footer-links">
                <a
                    v-for="(link, index) in links"
                    :key="index"
                    :href="link.url"
                    class="footer-link"
                    @click.prevent="handleLinkClick(link)"
                    @keydown.enter="handleLinkClick(link)"
                >
                    {{ link.title }}
                </a>
            </nav>
        </div>
    </footer>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    text: {
        type: String,
        default: ''
    },
    links: {
        type: Array,
        default: () => []
    },
    backgroundColor: {
        type: String,
        default: '#f5f5f5'
    },
    textColor: {
        type: String,
        default: '#333'
    },
    padding: {
        type: String,
        default: '20px 0'
    },
    alignment: {
        type: String,
        default: 'center',
        validator: (value) => ['left', 'center', 'right'].includes(value)
    },
    hideOnMobile: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['link-click'])

const handleLinkClick = (link) => {
    emit('link-click', link)
    // 如果需要默认跳转可以取消注释下面这行
    // window.location.href = link.url
}
</script>

<style scoped>
.footer-container {
    transition: all 0.3s ease;
    font-family: Arial, sans-serif;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.footer-text {
    display: block;
    margin-bottom: 8px;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}

.footer-link {
    color: inherit;
    text-decoration: none;
    transition: opacity 0.2s ease;
}

.footer-link:hover,
.footer-link:focus {
    opacity: 0.7;
    outline: 2px solid currentColor;
    outline-offset: 2px;
}

@media (max-width: 768px) {
    .footer-links {
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .hide-on-mobile {
        display: none;
    }
}
</style>
