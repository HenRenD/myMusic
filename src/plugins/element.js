import {
    ElHeader,
    ElContainer,
    ElRow,
    ElInput,
    ElAside,
    ElMain,
    ElFooter,
    ElCarousel,
    ElCarouselItem,
    ElScrollbar,
    ElTable,
    ElTableColumn,
    ElPagination,
    ElLoading,
    ElMessage,
    ElDialog
} from 'element-plus'

export default (app) => {
    app.use(ElHeader)
    app.use(ElContainer)
    app.use(ElMain)
    app.use(ElFooter)
    app.use(ElAside)
    app.use(ElRow)
    app.use(ElInput)
    app.use(ElCarouselItem)
    app.use(ElCarousel)
    app.use(ElScrollbar)
    app.use(ElTable)
    app.use(ElTableColumn)
    app.use(ElPagination)
    app.use(ElLoading)
    app.use(ElMessage)
    app.use(ElDialog)
}
