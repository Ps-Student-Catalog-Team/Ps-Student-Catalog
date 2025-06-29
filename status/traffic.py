import re
import os

# 初始化字典，用于存储IP地址的数据使用情况
ip_data_usage = {}

# 正则表达式匹配IP地址
ip_pattern = r'IP 地址：(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'

# 正则表达式匹配数据使用量
data_usage_pattern = r'总输出数据大小: (\d+) 字节，总输入数据大小: (\d+) 字节'

# 指定日志文件所在的文件夹路径
log_folder_path = './server_log'  # 替换为你的日志文件夹路径

# 遍历文件夹中的所有文件
for filename in os.listdir(log_folder_path):
    if filename.startswith('vpn_') and filename.endswith('.log'):
        file_path = os.path.join(log_folder_path, filename)
        print(f"正在处理文件: {file_path}")

        # 打开日志文件
        with open(file_path, 'r', encoding='utf-8') as file:
            for line in file:
                # 提取IP地址
                ip_match = re.search(ip_pattern, line)
                if ip_match:
                    ip = ip_match.group(1)
                    if ip not in ip_data_usage:
                        ip_data_usage[ip] = {'upload': 0, 'download': 0}

                # 提取数据使用量
                data_match = re.search(data_usage_pattern, line)
                if data_match:
                    upload = int(data_match.group(1))
                    download = int(data_match.group(2))

                    # 根据上下文找到对应的IP地址
                    # 这里需要结合上下文来找到对应的IP地址
                    # 这里简化处理，假设上一行包含IP地址
                    for ip in ip_data_usage:
                        ip_data_usage[ip]['upload'] += upload
                        ip_data_usage[ip]['download'] += download


# 输出结果
def format_size(bytes_count):
    if bytes_count == 0:
        return "0 B"
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if bytes_count < 1024:
            return f"{bytes_count:.2f} {unit}"
        bytes_count /= 1024
    return f"{bytes_count:.2f} TB"


# 输出到控制台
for ip, usage in ip_data_usage.items():
    print(f"IP地址: {ip}")
    print(f"上传数据量: {format_size(usage['upload'])}")
    print(f"下载数据量: {format_size(usage['download'])}")
    print("------------------------")

# 将结果保存到文件
with open('data_usage_results.txt', 'w') as result_file:
    for ip, usage in ip_data_usage.items():
        result_file.write(f"IP地址: {ip}\n")
        result_file.write(f"上传数据量: {format_size(usage['upload'])}\n")
        result_file.write(f"下载数据量: {format_size(usage['download'])}\n")
        result_file.write("------------------------\n")

print("所有日志文件处理完成，结果已保存到 data_usage_results.txt 文件中。")
