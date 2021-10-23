<template>
    <div class="goodCommentsContainer" v-show="comments.length">
        <h2>最新评论</h2>
        <ul>
            <li v-for="item in comments" :key="item.commnetId">
                <img :src="item.user.avatarUrl" alt="">
                <div>
                    <span class="info">
                        <span class="nickname">{{item.user.nickname}}:</span>{{item.content}}<br>
                        <span class="time">{{formatTime(item.time)}}</span>
                    </span>
                    <span class="like iconfont"><i>&#xe617;</i>{{item.likedCount}}</span>
                </div>
            </li>
        </ul>
    </div>
    <div class='noComments' v-show="!comments.length">还没有评论哦~</div>
</template>

<script>
export default {
    name: "MvComments",
    props: ["comments"],
    setup() {
        // 格式化时间
        function formatTime(time) {
            let localTime = new Date(time);
            let year = localTime.getFullYear();
            let month = String(localTime.getMonth() + 1).padStart(2, 0);
            let day = String(localTime.getDate()).padStart(2, 0);
            let hour = String(localTime.getHours()).padStart(2, 0);
            let minutes = String(localTime.getMinutes()).padStart(2, 0);
            let second = String(localTime.getSeconds()).padStart(2, 0);
            return (
                year +
                "-" +
                month +
                "-" +
                day +
                "    " +
                hour +
                ":" +
                minutes +
                ":" +
                second
            );
        }
        return {
            formatTime,
        };
    },
};
</script>

<style scoped>
.goodCommentsContainer {
    width: 100%;
}
h2 {
    font-size: 20px;
}
li {
    display: flex;
    width: 100%;
    padding-top: 20px;
}
ul li:last-child {
    border: none;
}
img {
    width: 37px;
    height: 37px;
    margin-right: 10px;
    border-radius: 50%;
}
li div {
    flex: 1;
    display: flex;
    padding: 0 0 20px 5px;
    border-bottom: 1px solid #f2f2f1;
}
ul li:last-child div {
    border: none;
}
.info {
    flex: 1;
}
.like {
    width: 60px;
    height: 100%;
    color: #cbbebe;
    font-size: 12px;
    text-align: center;
    cursor: pointer;
    user-select: none;
}
.like i {
    font-style: normal;
    margin-right: 5px;
    vertical-align: middle;
}
.nickname {
    color: #7791c9;
    margin-right: 10px;
}
.time {
    color: #cbbebe;
}
.noComments {
    width: 100%;
    margin: 50px 300px;
    color: #333;
    font-size: 16px;
}
</style>
