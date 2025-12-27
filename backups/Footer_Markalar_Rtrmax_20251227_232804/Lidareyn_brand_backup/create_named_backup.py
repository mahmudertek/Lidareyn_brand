
import os
import shutil
import datetime

# Configuration
SOURCE_DIR = 'c:\\Users\\pc\\Desktop\\Lidareyn_brand'
BACKUP_ROOT = os.path.join(SOURCE_DIR, 'backups')
TIMESTAMP = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
BACKUP_NAME = f"Footer_Markalar_Rtrmax_{TIMESTAMP}"
TARGET_DIR = os.path.join(BACKUP_ROOT, BACKUP_NAME)

# Create backup directory
if not os.path.exists(TARGET_DIR):
    os.makedirs(TARGET_DIR)

# Copy files
print(f"Backing up to: {TARGET_DIR}")

ignore_patterns = shutil.ignore_patterns('backups', 'node_modules', '.git', '__pycache__', 'dist', '.vscode')

try:
    shutil.copytree(SOURCE_DIR, os.path.join(TARGET_DIR, 'Lidareyn_brand_backup'), ignore=ignore_patterns)
    print("Backup completed successfully.")
except Exception as e:
    print(f"Backup failed: {e}")
