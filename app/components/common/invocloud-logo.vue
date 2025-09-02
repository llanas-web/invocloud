<script setup lang="ts">
const containerRef = ref<HTMLElement | null>(null)
const size = ref(0)

const props = defineProps<{
    onClick?: () => void
}>()

onMounted(() => {
    if (!containerRef.value) return

    const resizeObserver = new ResizeObserver(([entry]) => {
        size.value = Math.min(entry!.contentRect.width, entry!.contentRect.height)
    })

    resizeObserver.observe(containerRef.value)
})

const circles = ref([
    { scale: 1.2, startAngle: 0, endAngle: 288, color: '#9fc1ff', speed: '5s' },
    { scale: 1, startAngle: 90, endAngle: 378, color: '#9fc1ff', speed: '8s' },
    { scale: 0.8, startAngle: 180, endAngle: 468, color: '#9fc1ff', speed: '12s' },
])

const generateArcPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, startAngle)
    const end = polarToCartesian(cx, cy, r, endAngle)

    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1'

    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 1, end.x, end.y].join(' ')
}

const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0

    return {
        x: cx + (r * Math.cos(angleInRadians)),
        y: cy + (r * Math.sin(angleInRadians))
    }
}
</script>

<template>
    <div ref="containerRef" class="relative min-h-80 w-full">
        <!-- décorations et effets centrés -->
        <!-- <img src="~/assets/images/big-btn-2.png"
                            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" /> -->
        <!-- <img src="~/assets/images/big-btn.png"
                            class="absolute size-64 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" /> -->
        <NuxtImg src="/images/hero-effect.png" alt="Invocloud Logo Background Effect" size="100vw sm:50vw md:400px"
            quality="80" format="webp" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                            rounded-full aspect-square w-[30%] bg-linear-150 from-primary/80 to-primary/90
                            drop-shadow-2xl drop-shadow-primary
                            opacity-80
                            "></div>
        <svg v-if="size" class="absolute w-full h-full top-0 left-0" :viewBox="`0 0 ${size} ${size}`"
            preserveAspectRatio="xMidYMid meet">
            <g v-for="(circle, index) in circles" :key="index">
                <path :d="generateArcPath(
                    size / 2,
                    size / 2,
                    (size / 2) * 0.8 * circle.scale,
                    circle.startAngle,
                    circle.endAngle
                )" :stroke="circle.color" stroke-width="1" fill="none" stroke-linecap="round"
                    :class="`origin-center animate-rotate-${index}`" />
                <circle :cx="polarToCartesian(size / 2, size / 2, (size / 2) * 0.8 * circle.scale, circle.startAngle).x"
                    :cy="polarToCartesian(size / 2, size / 2, (size / 2) * 0.8 * circle.scale, circle.startAngle).y"
                    r="1" :fill="circle.color" :class="`origin-center animate-rotate-${index}`" />
            </g>
        </svg>
        <div :class="`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                            rounded-full border-2 border-primary w-[20%] aspect-square bg-linear-150 from-white to-80% to-primary/80
                            drop-shadow-xl drop-shadow-primary-800
                            bounce ${!!props.onClick ? 'cursor-pointer' : ''} p-5 flex justify-center items-center`"
            @click="() => !!props.onClick ? props.onClick() : null">
            <UIcon name="i-custom:invocloud-logo" class="text-white size-full aspect-square" />
        </div>
    </div>
</template>


<style scoped>
@keyframes rotate {
    to {
        transform: rotate(360deg);
    }
}

.animate-rotate-0 {
    animation: rotate 5s linear reverse infinite;
}

.animate-rotate-1 {
    animation: rotate 8s linear reverse infinite;
}

.animate-rotate-2 {
    animation: rotate 12s linear reverse infinite;
}

@keyframes subtleBounce {

    0%,
    100% {
        transform: scale(100%);
    }

    50% {
        transform: scale(105%);
    }
}

.bounce {
    animation: subtleBounce 2s ease-in-out infinite;
}
</style>
