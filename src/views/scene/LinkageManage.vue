<template>
  <div class="scene-linkage-container">
    <div class="form-header">
      <div class="form-row">
        <div class="form-item">
          <span class="required">*</span>
          <span class="label">规则名称</span>
          <el-input v-model="formData.name" placeholder="请输入规则名称" class="input-field" />
        </div>
        <div class="form-item">
          <span class="required">*</span>
          <span class="label">优先级</span>
          <el-select v-model="formData.priority" placeholder="请选择优先级" class="select-field">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </div>
        <div class="form-item">
          <span class="required">*</span>
          <span class="label">执行日期</span>
          <div class="radio-group">
            <el-radio v-model="formData.executeType" value="always">一直执行</el-radio>
            <el-radio v-model="formData.executeType" value="timed">定时执行</el-radio>
          </div>
        </div>
        <el-button type="primary" class="time-range-btn" @click="showTimeRangeDialog = true">触发时间段</el-button>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </div>

    <div class="tabs-container">
      <el-tabs v-model="activeTab" class="form-tabs">
        <el-tab-pane label="触发条件" name="condition">
          <div class="condition-list">
            <div v-for="(condition, index) in formData.conditions" :key="index" class="condition-card">
              <div class="condition-index">{{ index + 1 }}</div>
              <div class="condition-fields">
                <el-select v-model="condition.productType" placeholder="请选择产品类型" class="condition-select">
                  <el-option label="灯控制器" value="灯控制器" />
                  <el-option label="传感器" value="传感器" />
                  <el-option label="摄像头" value="摄像头" />
                </el-select>
                <el-select v-model="condition.device" placeholder="请选择设备" class="condition-select">
                  <el-option label="展厅隧道灯" value="展厅隧道灯" />
                  <el-option label="光亚展灯杆" value="光亚展灯杆" />
                </el-select>
                <el-select v-model="condition.triggerType" placeholder="请选择触发类型" class="condition-select">
                  <el-option label="事件触发" value="event" />
                  <el-option label="属性触发" value="attribute" />
                </el-select>
                <el-select v-model="condition.triggerCondition" placeholder="请选择触发条件" class="condition-select">
                  <el-option label="检测有人" value="有人" />
                  <el-option label="检测无人" value="无人" />
                  <el-option label="光照度低于阈值" value="光照度低" />
                  <el-option label="漏电" value="漏电" />
                </el-select>
              </div>
              <el-button v-if="index > 0" type="text" size="small" class="delete-btn" @click="removeCondition(index)">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <el-button class="add-condition-btn" @click="addCondition">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="执行动作" name="action">
          <div class="action-list">
            <div v-for="(action, index) in formData.actions" :key="index" class="action-card">
              <div class="action-index">{{ index + 1 }}</div>
              <div class="action-fields">
                <el-select v-model="action.productType" placeholder="请选择产品类型" class="action-select">
                  <el-option label="灯控制器" value="灯控制器" />
                  <el-option label="集控" value="集控" />
                  <el-option label="传感器" value="传感器" />
                </el-select>
                <el-select v-model="action.device" placeholder="请选择设备" class="action-select">
                  <el-option label="展厅隧道灯" value="展厅隧道灯" />
                  <el-option label="光亚展灯杆" value="光亚展灯杆" />
                </el-select>
                <el-select v-model="action.action" placeholder="请选择动作内容" class="action-select">
                  <el-option label="开灯" value="开灯" />
                  <el-option label="关灯" value="关灯" />
                  <el-option label="调光50%" value="调光50%" />
                  <el-option label="断电" value="断电" />
                </el-select>
              </div>
              <el-button v-if="index > 0" type="text" size="small" class="delete-btn" @click="removeAction(index)">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <el-button class="add-condition-btn" @click="addAction">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog title="触发时间段" v-model="showTimeRangeDialog" width="400px">
      <el-form :model="timeRangeData" label-width="80px">
        <el-form-item label="开始时间">
          <el-time-picker v-model="timeRangeData.startTime" placeholder="选择开始时间" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker v-model="timeRangeData.endTime" placeholder="选择结束时间" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTimeRangeDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmTimeRange">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Plus, Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const activeTab = ref('condition');
const showTimeRangeDialog = ref(false);

const formData = ref({
  name: '',
  priority: '',
  executeType: 'always',
  conditions: [
    {
      productType: '',
      device: '',
      triggerType: '',
      triggerCondition: ''
    }
  ],
  actions: [
    {
      productType: '',
      device: '',
      action: ''
    }
  ]
});

const timeRangeData = ref({
  startTime: '',
  endTime: ''
});

const addCondition = () => {
  formData.value.conditions.push({
    productType: '',
    device: '',
    triggerType: '',
    triggerCondition: ''
  });
};

const removeCondition = (index) => {
  if (formData.value.conditions.length > 1) {
    formData.value.conditions.splice(index, 1);
  }
};

const addAction = () => {
  formData.value.actions.push({
    productType: '',
    device: '',
    action: ''
  });
};

const removeAction = (index) => {
  if (formData.value.actions.length > 1) {
    formData.value.actions.splice(index, 1);
  }
};

const handleSave = () => {
  if (!formData.value.name) {
    ElMessage.warning('请输入规则名称');
    return;
  }
  if (!formData.value.priority) {
    ElMessage.warning('请选择优先级');
    return;
  }
  ElMessage.success('保存成功');
};

const handleCancel = () => {
  formData.value = {
    name: '',
    priority: '',
    executeType: 'always',
    conditions: [
      {
        productType: '',
        device: '',
        triggerType: '',
        triggerCondition: ''
      }
    ],
    actions: [
      {
        productType: '',
        device: '',
        action: ''
      }
    ]
  };
};

const confirmTimeRange = () => {
  showTimeRangeDialog.value = false;
  ElMessage.success('触发时间段设置成功');
};
</script>

<style scoped>
.scene-linkage-container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 30px);
  padding: 15px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.form-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.required {
  color: #f56c6c;
}

.label {
  color: #606266;
  white-space: nowrap;
}

.input-field {
  width: 200px;
}

.select-field {
  width: 160px;
}

.radio-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.tabs-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.form-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-tabs :deep(.el-tabs__header) {
  margin: 0;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
}

.form-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.form-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  padding: 0 30px;
}

.form-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.condition-list,
.action-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.condition-card,
.action-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  padding: 15px 20px;
  border-radius: 4px;
  min-width: 800px;
}

.condition-index,
.action-index {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.condition-fields,
.action-fields {
  flex: 1;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.condition-select,
.action-select {
  width: 180px;
}

.delete-btn {
  flex-shrink: 0;
  color: #f56c6c;
  padding: 4px 8px;
}

.add-condition-btn {
  width: 40px;
  height: 40px;
  border: 2px dashed #d9d9d9;
  background: #fff;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border-radius: 4px;
}

.add-condition-btn:hover {
  border-color: #409eff;
  color: #409eff;
}
</style>
