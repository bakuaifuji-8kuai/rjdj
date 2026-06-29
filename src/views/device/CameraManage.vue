<template>
  <div class="page-container">
    <div class="main-content">
      <div class="left-sidebar">
        <div class="sidebar-header">
          <el-input
            v-model="treeSearch"
            placeholder="请输入层级名称"
            class="sidebar-search"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-tree
          :data="treeData"
          :props="defaultProps"
          show-checkbox
          node-key="id"
          :default-expand-all="true"
          :expand-on-click-node="false"
        />
      </div>

      <div class="right-content">
        <div class="page-header">
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">删除</el-button>
          </div>
        </div>

        <div class="filter-bar">
          <el-select v-model="filterProduct" placeholder="请选择所属产品" class="filter-select">
            <el-option label="海康枪机摄像头" value="海康枪机摄像头" />
            <el-option label="海康球机摄像头" value="海康球机摄像头" />
          </el-select>
          <el-input v-model="filterKeyword" placeholder="请输入名称或编号查" class="filter-input" />
          <el-select v-model="filterNetworkStatus" placeholder="请选择网络状态" class="filter-select">
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
          </el-select>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <div class="table-wrapper">
          <el-table :data="filteredData" border class="data-table" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column prop="no" label="No" width="50" align="center"></el-table-column>
            <el-table-column prop="product" label="所属产品" min-width="120"></el-table-column>
            <el-table-column prop="deviceNo" label="设备编号" min-width="180" sortable></el-table-column>
            <el-table-column prop="name" label="设备名称" min-width="120" sortable></el-table-column>
            <el-table-column prop="deviceType" label="设备类型" width="80" align="center"></el-table-column>
            <el-table-column prop="lampPost" label="所属灯杆" min-width="100"></el-table-column>
            <el-table-column prop="networkStatus" label="网络状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="row.networkStatus === 'online' ? 'success' : 'danger'" size="small">
                  {{ row.networkStatus === 'online' ? '在线' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastOnline" label="最后在线时间" min-width="160" sortable></el-table-column>
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="handleEdit(row)">修改</el-button>
                <el-button type="text" size="small" @click="handleDetail(row)">详情</el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-bar">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="prev, pager, next, jumper, ->, total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <el-dialog :title="dialogTitle" v-model="showAddDialog" width="600px">
      <el-form :model="formData" label-width="100px" class="form-container">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*所属产品" prop="product">
              <el-select v-model="formData.product" placeholder="请选择所属产品" class="form-select">
                <el-option label="海康枪机摄像头" value="海康枪机摄像头" />
                <el-option label="海康球机摄像头" value="海康球机摄像头" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*设备编号" prop="deviceNo">
              <el-input v-model="formData.deviceNo" placeholder="请输入设备编号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*设备名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备型号" prop="model">
              <el-input v-model="formData.model" placeholder="请输入设备型号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="*摄像头类型" prop="cameraType">
              <el-select v-model="formData.cameraType" placeholder="请选择摄像头类型" class="form-select">
                <el-option label="枪机" value="枪机" />
                <el-option label="半球" value="半球" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="*所属层级" prop="level">
              <el-select v-model="formData.level" placeholder="请选择所属层级" class="form-select">
                <el-option label="长沙" value="长沙" />
                <el-option label="岳麓区" value="岳麓区" />
                <el-option label="先导路" value="先导路" />
                <el-option label="力唯中天1栋" value="力唯中天1栋" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属灯杆" prop="lampPost">
              <el-select v-model="formData.lampPost" placeholder="请选择" class="form-select">
                <el-option label="展厅隧道灯" value="展厅隧道灯" />
                <el-option label="光亚展灯杆" value="光亚展灯杆" />
                <el-option label="1号楼-极简05" value="1号楼-极简05" />
                <el-option label="2号楼-极简08" value="2号楼-极简08" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备经度" prop="longitude">
              <el-input v-model="formData.longitude" placeholder="请输入">
                <template #suffix>
                  <el-icon><MapLocation /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备纬度" prop="latitude">
              <el-input v-model="formData.latitude" placeholder="请输入">
                <template #suffix>
                  <el-icon><MapLocation /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="IP地址" prop="ipAddress">
              <el-input v-model="formData.ipAddress" placeholder="请输入IP地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="端口号" prop="port">
              <el-input v-model="formData.port" placeholder="请输入端口号" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="详情" v-model="showDetailDialog" width="500px">
      <el-descriptions :column="2" :data="detailData" border>
        <el-descriptions-item label="所属产品">{{ detailData.product }}</el-descriptions-item>
        <el-descriptions-item label="设备编号">{{ detailData.deviceNo }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="设备型号">{{ detailData.model }}</el-descriptions-item>
        <el-descriptions-item label="摄像头类型">{{ detailData.cameraType }}</el-descriptions-item>
        <el-descriptions-item label="所属层级">{{ detailData.level }}</el-descriptions-item>
        <el-descriptions-item label="所属灯杆">{{ detailData.lampPost }}</el-descriptions-item>
        <el-descriptions-item label="设备经度">{{ detailData.longitude }}</el-descriptions-item>
        <el-descriptions-item label="设备纬度">{{ detailData.latitude }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailData.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="端口号">{{ detailData.port }}</el-descriptions-item>
        <el-descriptions-item label="网络状态">
          <el-tag :type="detailData.networkStatus === 'online' ? 'success' : 'danger'" size="small">
            {{ detailData.networkStatus === 'online' ? '在线' : '离线' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后在线时间">{{ detailData.lastOnline }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Search, MapLocation } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const treeSearch = ref('');
const filterProduct = ref('');
const filterKeyword = ref('');
const filterNetworkStatus = ref('');
const currentPage = ref(1);
const pageSize = ref(15);
const selectedRows = ref([]);
const showAddDialog = ref(false);
const showDetailDialog = ref(false);
const dialogTitle = ref('新增');
const editingId = ref(null);
const formData = ref({
  product: '',
  deviceNo: '',
  name: '',
  model: '',
  cameraType: '枪机',
  level: '',
  lampPost: '',
  longitude: '',
  latitude: '',
  ipAddress: '',
  port: ''
});
const detailData = ref({});

const treeData = ref([
  {
    id: 1,
    label: '长沙',
    children: [
      {
        id: 2,
        label: '岳麓区',
        children: [
          { id: 3, label: '先导路' },
          { id: 4, label: '力唯中天1栋' }
        ]
      }
    ]
  }
]);

const defaultProps = {
  children: 'children',
  label: 'label'
};

const mockData = ref([
  { no: 1, product: '海康枪机摄像头', deviceNo: 'd31c52e77ed045db87', name: '特种照明', deviceType: '枪机', lampPost: '展厅隧道灯', networkStatus: 'offline', lastOnline: '2026-01-10 19:10:00' },
  { no: 2, product: '海康枪机摄像头', deviceNo: '66c0443f92f94d0ebce', name: '展厅入口', deviceType: '枪机', lampPost: '展厅隧道灯', networkStatus: 'offline', lastOnline: '2026-01-10 19:10:00' },
  { no: 3, product: '海康枪机摄像头', deviceNo: 'df56e1193c464153bf1', name: '路灯全景', deviceType: '枪机', lampPost: '展厅隧道灯', networkStatus: 'online', lastOnline: '2026-04-28 17:50:00' },
  { no: 4, product: '海康枪机摄像头', deviceNo: '5dfe7819888140f9b7d', name: '路灯大屏', deviceType: '枪机', lampPost: '展厅隧道灯', networkStatus: 'online', lastOnline: '2026-04-28 17:50:00' },
  { no: 5, product: '海康枪机摄像头', deviceNo: '2572900662644fe7b0d', name: '隧道直筒摄像头', deviceType: '枪机', lampPost: '展厅隧道灯', networkStatus: 'online', lastOnline: '2026-04-28 17:50:00' },
  { no: 6, product: '海康枪机摄像头', deviceNo: 'a41b5ab812454bc69f3', name: '思科来展厅', deviceType: '枪机', lampPost: '展厅隧道灯', networkStatus: 'online', lastOnline: '2026-04-28 17:50:00' },
  { no: 7, product: '海康球机摄像头', deviceNo: 'f05921c29d02420b90d', name: '展会监控', deviceType: '半球', lampPost: '光亚展灯杆', networkStatus: 'offline', lastOnline: '2024-07-11 10:40:00' },
  { no: 8, product: '海康球机摄像头', deviceNo: '199b98f8b87d498ab03', name: '展厅入口', deviceType: '球机', lampPost: '-', networkStatus: 'offline', lastOnline: '2024-11-30 10:10:00' },
  { no: 9, product: '海康球机摄像头', deviceNo: '199b98f8b87d498ab03', name: '路灯展厅操作区监控', deviceType: '球机', lampPost: '1号楼-极简05', networkStatus: 'offline', lastOnline: '2024-11-30 10:10:00' },
  { no: 10, product: '海康球机摄像头', deviceNo: '4606f32216694897a26', name: '路灯展厅灯杆区监控', deviceType: '球机', lampPost: '2号楼-极简08', networkStatus: 'offline', lastOnline: '2024-11-30 10:10:00' },
  { no: 11, product: '海康球机摄像头', deviceNo: '30faa1258de945c7acd', name: '路灯展厅隧道区监控', deviceType: '球机', lampPost: '-', networkStatus: 'offline', lastOnline: '2024-11-30 10:10:00' },
  { no: 12, product: '海康球机摄像头', deviceNo: '1f7a35628d3a4c718f6', name: '路灯展厅模组区监控', deviceType: '球机', lampPost: '-', networkStatus: 'offline', lastOnline: '2024-11-30 10:10:00' }
]);

const total = computed(() => mockData.value.length);

const filteredData = computed(() => {
  let data = [...mockData.value];
  if (filterProduct.value) {
    data = data.filter(item => item.product === filterProduct.value);
  }
  if (filterKeyword.value) {
    const keyword = filterKeyword.value.toLowerCase();
    data = data.filter(item => item.name.toLowerCase().includes(keyword) || item.deviceNo.toLowerCase().includes(keyword));
  }
  if (filterNetworkStatus.value) {
    data = data.filter(item => item.networkStatus === filterNetworkStatus.value);
  }
  return data.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
});

const handleSearch = () => {
  currentPage.value = 1;
};

const handleReset = () => {
  filterProduct.value = '';
  filterKeyword.value = '';
  filterNetworkStatus.value = '';
  currentPage.value = 1;
};

const handleSelectionChange = (val) => {
  selectedRows.value = val;
};

const handleAdd = () => {
  dialogTitle.value = '新增';
  editingId.value = null;
  showAddDialog.value = true;
  formData.value = {
    product: '',
    deviceNo: '',
    name: '',
    model: '',
    cameraType: '枪机',
    level: '',
    lampPost: '',
    longitude: '',
    latitude: '',
    ipAddress: '',
    port: ''
  };
};

const handleEdit = (row) => {
  dialogTitle.value = '修改';
  editingId.value = row.deviceNo;
  showAddDialog.value = true;
  formData.value = { ...row };
};

const handleDetail = (row) => {
  showDetailDialog.value = true;
  detailData.value = { ...row };
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该设备吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const index = mockData.value.findIndex(item => item.deviceNo === row.deviceNo);
    if (index !== -1) {
      mockData.value.splice(index, 1);
      ElMessage.success('删除成功')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
};

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个设备吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    selectedRows.value.forEach(row => {
      const index = mockData.value.findIndex(item => item.deviceNo === row.deviceNo);
      if (index !== -1) {
        mockData.value.splice(index, 1);
      }
    });
    selectedRows.value = [];
    ElMessage.success('删除成功')
  } catch {
    ElMessage.info('已取消删除')
  }
};

const handleConfirm = () => {
  if (!formData.value.product || !formData.value.deviceNo || !formData.value.name || !formData.value.cameraType || !formData.value.level) {
    ElMessage.warning('请填写所有必填字段');
    return;
  }
  
  if (editingId.value) {
    const index = mockData.value.findIndex(item => item.deviceNo === editingId.value);
    if (index !== -1) {
      mockData.value[index] = {
        ...mockData.value[index],
        product: formData.value.product,
        deviceNo: formData.value.deviceNo,
        name: formData.value.name,
        model: formData.value.model,
        cameraType: formData.value.cameraType,
        deviceType: formData.value.cameraType,
        level: formData.value.level,
        lampPost: formData.value.lampPost || '-',
        longitude: formData.value.longitude,
        latitude: formData.value.latitude,
        ipAddress: formData.value.ipAddress,
        port: formData.value.port
      };
      ElMessage.success('修改成功');
    }
  } else {
    const newRecord = {
      no: mockData.value.length + 1,
      product: formData.value.product,
      deviceNo: formData.value.deviceNo,
      name: formData.value.name,
      model: formData.value.model,
      cameraType: formData.value.cameraType,
      deviceType: formData.value.cameraType,
      level: formData.value.level,
      lampPost: formData.value.lampPost || '-',
      longitude: formData.value.longitude,
      latitude: formData.value.latitude,
      ipAddress: formData.value.ipAddress,
      port: formData.value.port,
      networkStatus: 'online',
      lastOnline: new Date().toLocaleString()
    };
    mockData.value.push(newRecord);
    ElMessage.success('新增成功');
  }
  showAddDialog.value = false;
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};
</script>

<style scoped>
.page-container {
  display: flex;
  height: calc(100vh - 60px);
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-sidebar {
  width: 200px;
  background: #fafafa;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.sidebar-search {
  width: 100%;
}

.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 15px;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  width: 180px;
}

.filter-input {
  width: 200px;
}

.table-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  min-height: 0;
}

.data-table {
  width: 100%;
  min-width: 1200px;
}

.pagination-bar {
  display: flex;
  justify-content: center;
  padding: 15px 0;
}

.form-container {
  padding: 10px 0;
}

.form-select {
  width: 100%;
}
</style>
