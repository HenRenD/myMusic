<template>
    <el-scrollbar>
        <!-- 轮播图组价 -->
        <div class="slideshow">
            <Slideshow></Slideshow>
        </div>
        <!-- 推荐音乐组件 -->
        <div class="recommendList">
            <RecommendList></RecommendList>
        </div>
        <!-- 新音乐组件 -->
        <div class="newMusic">
            <Newmusic></Newmusic>
        </div>
        <!-- 推荐mv组件 -->
        <div class="recommendMvs">
            <RecommendMvs></RecommendMvs>
        </div>
    </el-scrollbar>
</template>

<script>
import Slideshow from "./Slideshow.vue";
import RecommendList from "./RecommendList.vue";
import Newmusic from "./Newmusic.vue";
import RecommendMvs from "./RecommendMvs.vue";
export default {
    components: {
        Slideshow,
        RecommendList,
        Newmusic,
        RecommendMvs,
    },
};
</script>

<style scoped>
.el-scrollbar {
    width: 100%;
    height: 100%;
}
.slideshow,
.recommendList,
.newMusic,
.recommendMvs {
    width: 80%;
    margin: 20px auto;
}
</style>
