<template>
    <div class="mvDetail">
        <h2>mv详情</h2>
        <div class="video">
            <video :src="mvInfo.url" controls :poster="mvInfo.img" controlsList='nodownload' autoplay ref="video" disablePictureInPicture></video>
        </div>
        <div class="author">
            <img :src="mvInfo.img" alt="">
            <span>{{mvInfo.authorName}}</span>
        </div>
        <div class="info">
            <p>{{mvInfo.title}}</p>
            <p><span>发布：{{mvInfo.time}}</span>播放：{{mvInfo.playCount}}次</p>
        </div>
    </div>
</template>

<script>
import { getCurrentInstance, ref } from "vue";
export default {
    name: "MvDetail",
    props: ["mvInfo"],
    setup() {
        const { proxy: methods } = getCurrentInstance();
        let isPlaying = ref(false);
        // 点击播放视频
        function playVideo(e) {
            e.stopPropagation();
            methods.$refs.video.play();
            isPlaying.value = true;
        }
        return {
            playVideo,
            isPlaying,
        };
    },
};
</script>

<style scoped>
.mvDetail {
    width: 100%;
    height: 100%;
}
h2 {
    font-size: 20px;
    margin: 0;
    padding: 0;
    margin-bottom: 15px;
}
.video {
    position: relative;
    width: 100%;
}
video {
    width: 100%;
    height: 375px;
    margin: 0;
    padding: 0;
    border-radius: 5px;
    background-color: black;
}
.author {
    width: 100%;
    font-size: 18px;
    margin: 10px 0;
}
.author img {
    width: 60px;
    height: 60px;
    vertical-align: middle;
    border-radius: 50%;
    margin-right: 10px;
}
.info p:first-child {
    font-size: 20px;
    font-weight: 700;
}
.info p:last-child {
    font-size: 14px;
    color: #bebebe;
}
p span {
    margin-right: 10px;
}
</style>
