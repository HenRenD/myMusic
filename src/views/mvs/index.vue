<template>
    <el-scrollbar>
        <div class="mvs">
            <div class="area">
                <ul>
                    <li>地区：</li>
                    <li @click="getMvsByArea(item)" v-for="(item,index) in area" :key="index" :class="item===currentArea?'current':''">{{item}}</li>
                </ul>
            </div>
            <div class="type">
                <ul>
                    <li>类型：</li>
                    <li @click="getMvsByType(item)" v-for="(item,index) in type" :key="index" :class="item===currentType?'current':''">{{item}}</li>
                </ul>
            </div>
            <div class="sort">
                <ul>
                    <li>排序：</li>
                    <li @click="getMvsBySort(item)" v-for="(item,index) in sort" :key="index" :class="item===currentSort?'current':''">{{item}}</li>
                </ul>
            </div>
            <div class="content_">
                <ul>
                    <li v-for="item in mvs" :key="item.id" @click="toMv(item.id)">
                        <div class="img">
                            <img :src="item.cover" alt="">
                            <span class="playCount iconfont">&#xea82;&nbsp;{{Math.floor(item.playCount / 10000)}}万</span>
                            <span class="time">{{formatTime(item.duration)}}</span>
                            <div class="playfont iconfont">
                                <span></span>
                                <i>&#xea82;</i>
                            </div>
                        </div>
                        <div class="des">{{item.name}}</div>
                        <div class="name">{{item.artistName}}</div>
                    </li>
                    <li v-for="n in 4" :key="n" class="fill"></li>
                </ul>
            </div>
            <div class="changePage">
                <el-pagination @current-change="changePage" :page-size="20" :current-page="currentPage" layout="prev, pager, next" :total="total">
                </el-pagination>
            </div>
        </div>
    </el-scrollbar>
</template>

<script>
import { getCurrentInstance, ref, computed } from "vue";
export default {
    setup() {
        const { proxy: methods } = getCurrentInstance();
        let area = ["全部", "内地", "港台", "欧美", "日本", "韩国"];
        let type = ["全部", "官方版", "原声音", "现场版", "网易出品"];
        let sort = ["上升最快", "最新", "最热"];
        let currentArea = ref("");
        let currentType = ref("");
        let currentSort = ref("");
        let currentPage = ref(1);
        let total = ref(0);
        let offset = computed(() => {
            return (currentPage.value - 1) * 20;
        });
        let mvs = ref([]);
        // 初始化获取mv数据
        function getMvs(area, type, sort) {
            currentArea.value = area;
            currentType.value = type;
            currentSort.value = sort;
            methods.http
                .get(
                    `/mv/all?offset=${offset.value}&limit=20&area=${currentArea.value}&type=${currentType.value}&order=${currentSort.value}`
                )
                .then((res) => {
                    mvs.value = res.data.data;
                    total.value = res.data.count;
                })
                .catch((error) => {
                    methods.$message.info({
                        message: `似乎出了一些错误~(${error})`,
                        center: true,
                        iconClass: "none",
                        duration: 3000,
                    });
                });
        }
        getMvs(area[0], type[0], sort[0]);
        // 格式化时间
        function formatTime(time) {
            time = time / 1000;
            let minutes = String(Math.floor(time / 60)).padStart(2, "0");
            let second = String(Math.floor(time % 60)).padStart(2, "0");
            return minutes + ":" + second;
        }
        // 按条件获取mvs
        function getMvsByArea(area) {
            currentPage.value = 1;
            currentArea.value = area;
            methods.http
                .get("/mv/all", {
                    params: {
                        offset: offset.value,
                        limit: 20,
                        area: currentArea.value,
                        type: currentType.value,
                        order: currentSort.value,
                        realIP: "116.25.146.177",
                    },
                })
                .then((res) => {
                    mvs.value = res.data.data;
                    total.value = res.data.count;
                })
                .catch((error) => {
                    methods.$message.info({
                        message: `似乎出了一些错误~(${error})`,
                        center: true,
                        iconClass: "none",
                        duration: 3000,
                    });
                });
        }
        function getMvsByType(type) {
            currentPage.value = 1;
            currentType.value = type;
            methods.http
                .get("/mv/all", {
                    params: {
                        offset: offset.value,
                        limit: 20,
                        area: currentArea.value,
                        type: currentType.value,
                        order: currentSort.value,
                        realIP: "116.25.146.177",
                    },
                })
                .then((res) => {
                    mvs.value = res.data.data;
                    total.value = res.data.count;
                })
                .catch((error) => {
                    methods.$message.info({
                        message: `似乎出了一些错误~(${error})`,
                        center: true,
                        iconClass: "none",
                        duration: 3000,
                    });
                });
        }
        function getMvsBySort(sort) {
            currentPage.value = 1;
            currentSort.value = sort;
            methods.http
                .get("/mv/all", {
                    params: {
                        offset: offset.value,
                        limit: 20,
                        area: currentArea.value,
                        type: currentType.value,
                        order: currentSort.value,
                        realIP: "116.25.146.177",
                    },
                })
                .then((res) => {
                    mvs.value = res.data.data;
                    total.value = res.data.count;
                })
                .catch((error) => {
                    methods.$message.info({
                        message: `似乎出了一些错误~(${error})`,
                        center: true,
                        iconClass: "none",
                        duration: 3000,
                    });
                });
        }
        // 页码改变
        function changePage(page) {
            currentPage.value = page;
            methods.http
                .get("/mv/all", {
                    params: {
                        offset: offset.value,
                        limit: 20,
                        area: currentArea.value,
                        type: currentType.value,
                        order: currentSort.value,
                        realIP: "116.25.146.177",
                    },
                })
                .then((res) => {
                    mvs.value = res.data.data;
                })
                .catch((error) => {
                    methods.$message.info({
                        message: `似乎出了一些错误~(${error})`,
                        center: true,
                        iconClass: "none",
                        duration: 3000,
                    });
                });
        }
        // 跳转到mv详情页
        function toMv(id) {
            methods.$root.$router.push(`/mv?mvsid=${id}`);
        }
        return {
            area,
            type,
            sort,
            total,
            mvs,
            formatTime,
            currentArea,
            currentType,
            currentSort,
            getMvsByArea,
            getMvsByType,
            getMvsBySort,
            currentPage,
            changePage,
            toMv,
        };
    },
};
</script>

<style scoped>
.el-scrollbar {
    width: 100%;
    height: 100%;
}
.mvs {
    position: relative;
    width: 80%;
    margin: 20px auto;
    box-sizing: border-box;
}
.area,
.type,
.sort,
.content,
ul {
    width: 100%;
}
ul {
    display: flex;
    justify-content: left;
    margin: 30px 0;
}
ul li {
    padding: 6px 25px;
    border-right: 1px solid #f2f2f1;
    line-height: 12px;
    color: #7f7f81;
    cursor: pointer;
}
li:hover {
    color: black;
}
ul li:first-child {
    padding: 6px 0;
}
ul li:first-child,
ul li:last-child {
    border: none;
}
.content_ ul {
    justify-content: space-between;
    flex-wrap: wrap;
}
.content_ ul li {
    width: 24%;
    padding: 0;
    border: none;
    margin: 20px 0;
}
.content_ ul .fill {
    width: 24%;
    height: 0;
    margin: 0;
}
.img {
    position: relative;
    height: 80%;
}
.img,
img {
    width: 100%;
    border-radius: 5px;
}
img {
    height: 100%;
}
.playCount {
    position: absolute;
    top: 5px;
    right: 10px;
    color: white;
    font-size: 15px;
}
.time {
    position: absolute;
    bottom: 5px;
    right: 10px;
    color: white;
    font-size: 15px;
}
.playfont {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 45px;
    height: 45px;
    border-radius: 50%;
    opacity: 0;
    transition: all 0.2s ease-in-out;
}
.playfont span {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: white;
    opacity: 0.5;
}
.playfont i {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #d33a31;
    font-style: normal;
    font-size: 20px;
    opacity: 1;
}
.content_ li:hover .playfont {
    opacity: 1;
}
.des {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #4a4a4a;
}
.name {
    color: #bebebe;
}
/* 分页 */
.changePage {
    margin: 0 auto;
    width: 50%;
}
ul li.current {
    color: #d33a31;
    background-color: #fdf6f5;
    border-radius: 10px;
}
</style>

