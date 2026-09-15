/* [软著核心代码] PageResult.java - 智光云枢分页查询返回体 */
package com.zgsq.illumination.common;


import java.io.Serializable;
import java.util.Collections;
import java.util.List;

/**
 * 分页查询统一返回体 {@code PageResult<T>}
 * <p>
 * 与 {@link Result} 搭配使用：{@code Result.ok(PageResult.of(list, total, pageNum, pageSize))}。
 *
 * @param <T> 列表项的类型（通常为 VO）
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class PageResult<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 当前页数据 */
    private List<T> list;
    /** 总记录数 */
    private long total;
    /** 当前页码（从 1 开始） */
    private int pageNum;
    /** 每页大小 */
    private int pageSize;

    /**
     * 无参构造
     */
    public PageResult() {
    }

    /**
     * 全参构造
     *
     * @param list     当前页数据列表
     * @param total    数据库中总记录数
     * @param pageNum  当前请求页码
     * @param pageSize 当前请求每页大小
     */
    public PageResult(List<T> list, long total, int pageNum, int pageSize) {
        this.list = list;
        this.total = total;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
    }

    /**
     * 工厂方法：根据 MyBatis-Plus 的 IPage 生成 PageResult
     *
     * @param list     当前页数据（通常为手动组装的 VO 列表）
     * @param total    数据库总记录数
     * @param pageNum  当前页码
     * @param pageSize 每页大小
     * @param <T>      列表元素类型
     * @return PageResult 实例
     */
    public static <T> PageResult of(List<T> list, long total, int pageNum, int pageSize) {
        return new PageResult<>(list, total, pageNum, pageSize);
    }

    /**
     * 空页返回（total=0）
     *
     * @param pageNum  当前请求页码
     * @param pageSize 当前请求每页大小
     * @param <T>      列表元素类型
     * @return 空的 PageResult
     */
    public static <T> PageResult empty(int pageNum, int pageSize) {
        return new PageResult<>(Collections.emptyList(), 0L, pageNum, pageSize);
    }


    // ========== 手动生成: getter / setter ==========
    public List<T> getList() { return this.list; }
    public void setList(List<T> list) { this.list = list; }
    public long getTotal() { return this.total; }
    public void setTotal(long total) { this.total = total; }
    public int getPageNum() { return this.pageNum; }
    public void setPageNum(int pageNum) { this.pageNum = pageNum; }
    public int getPageSize() { return this.pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
}
