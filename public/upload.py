import boto3
import os

# Initialize a session using Amazon S3
s3 = boto3.client('s3')
bucket_name = 'cinedleframes'
local_root_directory = r'C:\Users\vikya\Desktop\scape\scape'  # The root directory containing multiple folders

def upload_directory(local_directory, bucket, s3_prefix=''):
    for root, dirs, files in os.walk(local_directory):
        for file in files:
            local_path = os.path.join(root, file)
            relative_path = os.path.relpath(local_path, local_directory)
            s3_path = os.path.join(s3_prefix, relative_path).replace("\\", "/")
            s3.upload_file(local_path, bucket, s3_path)
            print(f'Uploaded {local_path} to s3://{bucket}/{s3_path}')

# Upload each folder in the root directory
for item in os.listdir(local_root_directory):
    local_path = os.path.join(local_root_directory, item)
    if os.path.isdir(local_path):
        print(f'Uploading folder {local_path} to S3...')
        upload_directory(local_path, bucket_name, s3_prefix=item)
        print(f'Successfully uploaded {local_path} to s3://{bucket_name}/{item}/')

print('All folders have been uploaded.')
