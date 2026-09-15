/* [软著核心代码] RoleServiceImpl.java - 角色模块业务实现 */
package com.zgsq.illumination.role.service.impl;

import com.zgsq.illumination.common.ErrorCode;
import com.zgsq.illumination.common.PageResult;
import com.zgsq.illumination.exception.BusinessException;
import com.zgsq.illumination.role.dto.RoleDTO;
import com.zgsq.illumination.role.entity.Role;
import com.zgsq.illumination.role.mapper.RoleMapper;
import com.zgsq.illumination.role.service.RoleService;
import com.zgsq.illumination.role.vo.RoleVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 角色模块业务实现
 *
 * @author 智光云枢研发部
 * @since 1.0.0
 */
@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleMapper roleMapper;

    @Override
    public Long addRole(RoleDTO.RoleAddDTO dto) {
        // 角色编码唯一性校验
        Role existing = roleMapper.selectByCode(dto.getRoleCode());
        if (existing != null) {
            throw new BusinessException(ErrorCode.DATA_ALREADY_EXISTS, "角色编码已存在：" + dto.getRoleCode());
        }
        Role role = new Role();
        role.setRoleName(dto.getRoleName());
        role.setRoleCode(dto.getRoleCode());
        role.setRoleDesc(dto.getRoleDesc());
        role.setRoleStatus(dto.getRoleStatus() == null ? 0 : dto.getRoleStatus());
        LocalDateTime now = LocalDateTime.now();
        role.setCreateTime(now);
        role.setUpdateTime(now);
        roleMapper.insert(role);
        return role.getRoleId();
    }

    @Override
    public void updateRole(RoleDTO.RoleUpdateDTO dto) {
        Role role = roleMapper.selectById(dto.getRoleId());
        if (role == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND, "角色不存在");
        }
        if (dto.getRoleName() != null) {
            role.setRoleName(dto.getRoleName());
        }
        if (dto.getRoleCode() != null) {
            Role byCode = roleMapper.selectByCode(dto.getRoleCode());
            if (byCode != null && !byCode.getRoleId().equals(dto.getRoleId())) {
                throw new BusinessException(ErrorCode.DATA_ALREADY_EXISTS, "角色编码已被其它角色占用");
            }
            role.setRoleCode(dto.getRoleCode());
        }
        if (dto.getRoleDesc() != null) {
            role.setRoleDesc(dto.getRoleDesc());
        }
        if (dto.getRoleStatus() != null) {
            role.setRoleStatus(dto.getRoleStatus());
        }
        role.setUpdateTime(LocalDateTime.now());
        roleMapper.updateById(role);
    }

    @Override
    public void deleteRole(Long roleId) {
        roleMapper.deleteById(roleId);
    }

    @Override
    public PageResult<RoleVO> pageRole(RoleDTO.RoleQueryDTO query) {
        int pageNum = query.getSafePageNum();
        int pageSize = query.getSafePageSize();
        int offset = (pageNum - 1) * pageSize;
        long total = roleMapper.selectPageCount(query.getRoleName(), query.getRoleCode(), query.getRoleStatus());
        List<Role> list = roleMapper.selectPageList(query.getRoleName(), query.getRoleCode(),
                query.getRoleStatus(), offset, pageSize);
        List<RoleVO> voList = list.stream().map(this::toVO).collect(Collectors.toList());
        return PageResult.of(voList, total, pageNum, pageSize);
    }

    @Override
    public List<RoleVO> listRole() {
        List<Role> all = roleMapper.selectList(null);
        return all.stream().map(this::toVO).collect(Collectors.toList());
    }

    /** Entity → VO */
    private RoleVO toVO(Role role) {
        RoleVO vo = new RoleVO();
        vo.setRoleId(role.getRoleId());
        vo.setRoleName(role.getRoleName());
        vo.setRoleCode(role.getRoleCode());
        vo.setRoleDesc(role.getRoleDesc());
        vo.setRoleStatus(role.getRoleStatus());
        vo.setRoleStatusName(role.getRoleStatus() == null ? "" : (role.getRoleStatus() == 0 ? "启用" : "禁用"));
        vo.setCreateTime(role.getCreateTime());
        vo.setUpdateTime(role.getUpdateTime());
        return vo;
    }

}
