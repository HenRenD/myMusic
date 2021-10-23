<template>
    <div class="similarmv">
        <h2>相关推荐</h2>
        <ul>
            <li v-for="item in simiMvs" :key="item.id" @click="toMvs(item.id)">
                <div class="img">
                    <img :src="item.cover" alt="">
                    <span class="iconfont playCount">&#xea82;&nbsp;{{item.playCount}}</span>
                    <span class="time">{{formatTime(item.duration)}}</span>
                </div>
                <div class="info">
                    <span>{{item.name}}</span>
                    <span>by {{item.artistName}}</span>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import { getCurrentInstance } from "vue";
export default {
    name: "SimilarMv",
    props: ["simiMvs"],
    setup() {
        const { proxy: methods } = getCurrentInstance();
        // 格式化时间
        function formatTime(time) {
            time = time / 1000;
            let minutes = String(parseInt(time / 60)).padStart(2, "0");
            let second = String(parseInt(time % 60)).padStart(2, "0");
            return minutes + ":" + second;
        }
        // 跳转到mv详情页面
        function toMvs(id) {
            methods.$root.$router.push(`/mv?mvsid=${id}`);
        }
        return {
            formatTime,
            toMvs,
        };
    },
};
</script>

<style scoped>
.similarmv {
    width: 100%;
}
ul {
    widows: 100%;
}
h2 {
    font-size: 20px;
    margin-bottom: 15px;
}
li {
    width: 100%;
    display: flex;
    margin-bottom: 15px;
    cursor: pointer;
}
.img {
    position: relative;
    width: 50%;
}
img {
    width: 100%;
    border-radius: 5px;
}
.playCount {
    position: absolute;
    right: 3px;
    top: 2px;
    color: white;
    font-size: 12px;
}
.img .time {
    position: absolute;
    right: 3px;
    color: white;
    bottom: 2px;
}
.info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 50%;
    padding: 0 10px;
    box-sizing: border-box;
}
.info span:first-child {
    font-size: 15px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}
.info span:last-child {
    color: #bebebe;
}
</style>
