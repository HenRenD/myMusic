<template>
    <!-- 轮播图 -->
    <div class="slidshow" v-show="imageList.length">
        <el-carousel :interval="4000" height="200px" type="card" ref="card">
            <el-carousel-item v-for="(item,index) in imageList" :key="index">
                <img :src="item.imageUrl">
            </el-carousel-item>
        </el-carousel>
    </div>
</template>

<script>
import { ref, getCurrentInstance } from "vue";
export default {
    name: "Slideshow",
    setup() {
        const { proxy: methods } = getCurrentInstance();
        // 定义保存轮播图图片数据的变量
        let imageList = ref([]);
        function getImage() {
            methods.http.get("/banner").then((res) => {
                imageList.value = res.data.banners;
            });
        }
        getImage();
        return {
            imageList,
        };
    },
    updated() {
        this.$refs.card.next();
    },
};
</script>

<style scoped>
.slidshow {
    width: 100%;
    height: 100%;
}
.el-carousel__item {
    border-radius: 5px;
}
.el-carousel__item img {
    width: 100%;
    height: 100%;
}
.el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
}
.el-carousel__item:nth-child(2n + 1) {
    background-color: #d3dce6;
}
</style>
