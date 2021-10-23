<template>
    <div class="headInfo" v-if="listInfo.id">
        <div class="img">
            <img :src="listInfo.coverImgUrl" alt="">
        </div>
        <div class="explain">
            <h2>{{listInfo.name}}</h2>
            <p>
                <img :src="listInfo.creator.avatarUrl" alt="">
                {{listInfo.creator.nickname}}&nbsp;&nbsp;&nbsp;&nbsp;{{formatTime(listInfo.createTime)}}&nbsp;&nbsp;创建
            </p>
            <p class="button">
                <button class="iconfont"><span>&#xe629;</span>播放全部</button>
            </p>
            <p v-if="listInfo.tags.length">标签：{{listInfo.tags.join('/')}}</p>
            <p v-if="listInfo.description" class="des">简介：{{listInfo.description}}</p>
        </div>
    </div>
</template>

<script>
export default {
    name: "HeadInfo",
    // 接收参数
    props: ["listInfo"],
    setup(props) {
        // 格式化时间
        function formatTime(time) {
            let time_ = new Date(time);
            let year = time_.getFullYear();
            let month = String(time_.getMonth() + 1).padStart(2, "0");
            let day = String(time_.getDate()).padStart(2, "0");
            return year + "-" + month + "-" + day;
        }
        return {
            formatTime,
        };
    },
};
</script>

<style scoped>
.headInfo {
    width: 100%;
    display: flex;
}
.img {
    height: 200px;
    margin-right: 30px;
}
img {
    width: 200px;
    height: 200px;
}
.explain {
    font-size: 15px;
}
.explain h2 {
    font-size: 18px;
}
p {
    margin: 12px 0;
    padding: 0;
}
p img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 5px;
    vertical-align: middle;
}
.button {
    margin: 20px 0;
}
button {
    width: 110px;
    height: 30px;
    background-color: #f95143;
    border: none;
    outline: none;
    cursor: pointer;
    color: #fbdfd3;
    font-size: 15px;
    text-align: center;
    border-radius: 3px;
}
button span {
    margin-right: 5px;
}
.des {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}
</style>
