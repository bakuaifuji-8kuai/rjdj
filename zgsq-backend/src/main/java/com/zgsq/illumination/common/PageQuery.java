/* [软著核心代码] PageQuery.java - 智光云枢分页请求通用封装 */
package com.zgsq.illumination.common;


/**
 * 分页查询通用请求体.
 * <p>
 * 所有分页接口 (例如 /api/guanlang/page) 的入参都可以继承或直接使用本类.
 * 字段:
 * <ul>
 *   <li>{@code pageNum}  - 当前页码, 从 1 开始, 默认 1</li>
 *   <li>{@code pageSize} - 每页大小, 默认 10</li>
 *   <li>{@code keyword}  - 可选, 通用搜索关键字 (管廊编号 / 名称 模糊匹配)</li>
 * </ul>
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
public class PageQuery {

    /** 默认每页大小 */
    public final int DEFAULT_PAGE_SIZE = 10;
    /** 默认页码 */
    public final int DEFAULT_PAGE_NUM = 1;
    /** 允许的最大每页大小 (防止恶意请求拖垮 DB) */
    public final int MAX_PAGE_SIZE = 100;

    /** 当前请求页码, 1 为首页 */
    private Integer pageNum;
    /** 每页大小 */
    private Integer pageSize;
    /** 通用关键字 (模糊匹配) */
    private String keyword;

    /**
     * 取规范化后的 pageNum (兜底处理 null / 非法值)
     *
     * @return 合法页码, 最小值 1
     */
    public int getSafePageNum() {
        if (pageNum == null || pageNum < 1) {
            return DEFAULT_PAGE_NUM;
        }
        return pageNum;
    }

    /**
     * 取规范化后的 pageSize (兜底处理 null / 越界)
     *
     * @return 合法每页大小, 范围 [1, MAX_PAGE_SIZE]
     */
    public int getSafePageSize() {
        if (pageSize == null || pageSize < 1) {
            return DEFAULT_PAGE_SIZE;
        }
        if (pageSize > MAX_PAGE_SIZE) {
            return MAX_PAGE_SIZE;
        }
        return pageSize;
    }


    // ========== 手动生成: getter / setter ==========
    public Integer getPageNum() { return this.pageNum; }
    public void setPageNum(Integer pageNum) { this.pageNum = pageNum; }
    public Integer getPageSize() { return this.pageSize; }
    public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }
    public String getKeyword() { return this.keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
}
