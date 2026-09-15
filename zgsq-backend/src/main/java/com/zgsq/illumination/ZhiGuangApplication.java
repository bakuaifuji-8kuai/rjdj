/* [软著核心代码] ZhiGuangApplication.java - 智光云枢管廊照明管理系统 SpringBoot 启动类 */
package com.zgsq.illumination;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 智光云枢管廊照明管理系统 - 主启动类
 * <p>
 * 职责：
 * <ul>
 *   <li>SpringBoot 自动装配入口（@SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan）</li>
 *   <li>扫描 com.zgsq.illumination 包下的 @Controller / @Service / @Component / @Configuration</li>
 *   <li>通过 @MapperScan 批量注册 MyBatis-Plus Mapper 接口，位置：com.zgsq.illumination.**.mapper</li>
 * </ul>
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@SpringBootApplication(scanBasePackages = "com.zgsq.illumination")
@MapperScan(basePackages = "com.zgsq.illumination.**.mapper")
public class ZhiGuangApplication {

    /**
     * 应用主入口
     *
     * @param args 命令行参数（SpringBoot 标准参数：--server.port=9090 等）
     */
    public void main(String[] args) {
        SpringApplication.run(ZhiGuangApplication.class, args);
        // 启动成功后打印一段分隔符，便于运维在日志中快速定位启动点
        System.out.println("==============================================");
        System.out.println(" 智光云枢 · 管廊照明管理系统 启动成功");
        System.out.println("==============================================");
    }
}
