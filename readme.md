# S3 Force Delete Bucket

Empty and delete S3 buckets in one go!

# Use case
- If the S3 bucket to delete is not empty, it will be emptied first.
- If the S3 bucket is versioned, all object versions and delete markers are
  deleted.

# Example Usage

```js
import { forceDeleteBucket } from '@c-collamar/s3-force-delete-bucket';
import { S3Client } from '@aws-sdk/client-s3';

// prepare the S3 client
const s3 = new S3Client();

// name your bucket to delete, that's it!
await forceDeleteBucket('my-temporary-bucket', s3);
```