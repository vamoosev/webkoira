<script>
const images = import.meta.glob('@/assets/*.svg');

export default {
    props: {
        rank: {
            type: String,
            required: true
        },
        suit: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            imagePath: ''
        };
    },
    watch: {
        rank: 'updateImagePath',
        suit: 'updateImagePath'
    },
    mounted() {
        this.updateImagePath();
    },
    methods: {
        async updateImagePath() {
            const imageName = `${this.suit.toLowerCase()}_${this.rank.toLowerCase()}.svg`;
            const imageKey = Object.keys(images).find(key => key.includes(imageName));
            if (imageKey) {
                const imageModule = await images[imageKey]();
                this.imagePath = imageModule.default;
            } else {
                console.error(`Image not found: ${imageName}`);
            }
        }
    }
}
</script>

<template>
    <div>
        <img :src="imagePath" alt="Card Image">
    </div>
</template>