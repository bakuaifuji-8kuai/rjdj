import os

# 需要替换的层级数据映射
replacements = {
    '梅溪湖隧道': '先导路',
    '梅溪湖隧道1栋': '力唯中天1栋',
    '梅溪湖隧道2栋': '力唯中天2栋',
    '梅溪湖隧道3栋': '力唯中天3栋'
}

# 只处理src目录下的Vue和JS文件，排除dist目录
target_dir = 'src'

print('开始批量更新层级数据...\n')

# 遍历目录的函数
def process_directory(dir_path):
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith('.vue') or file.endswith('.js'):
                file_path = os.path.join(root, file)
                process_file(file_path)

# 处理单个文件
def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    for old_str, new_str in replacements.items():
        if old_str in content:
            content = content.replace(old_str, new_str)
            modified = True
    
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'已更新: {file_path}')

# 开始处理
process_directory(target_dir)
print('\n所有文件更新完成！')
