import { DeleteBucketCommand, DeleteObjectsCommand, ListObjectVersionsCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Force delete a bucket.
 * 
 * The bucket will be emptied if not yet. If the bucket is versioned, all
 * versioned objects and delete markers will be removed.
 * 
 * @param {string} bucketName Bucket name to delete.
 * @param {S3Client} s3Client S3 service client for the bucket.
 * @returns A list of errors as soon as they are encountered, if any.
 */
export async function forceDeleteBucket(bucketName, s3Client) {
  let hasNextObjs = false;
  let currKeyMarker = ''; // intellisense doesn't like seting undefined :(
  let currVerMarker = '';

  do {
    const listCmd = new ListObjectVersionsCommand({
      Bucket: bucketName,
      KeyMarker: currKeyMarker === '' ? undefined : currKeyMarker,
      VersionIdMarker: currVerMarker === '' ? undefined : currVerMarker
    });

    const listOutput = await s3Client.send(listCmd);
    hasNextObjs = listOutput.IsTruncated ?? false;
    currKeyMarker = listOutput.NextKeyMarker ?? '';
    currVerMarker = listOutput.NextVersionIdMarker ?? '';
    
    const toDelete = (listOutput.Versions ?? []).concat(listOutput.DeleteMarkers ?? []);

    if (toDelete.length) {
      const delObjsCmd = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: toDelete.map((obj) => ({
            Key: obj.Key ?? '',
            VersionId: obj.VersionId ?? ''
          }))
        }
      });
  
      const deleteOutput = await s3Client.send(delObjsCmd);
  
      if (deleteOutput.Errors?.length) {
        return deleteOutput.Errors;
      }
    }
  } while (hasNextObjs);

  const delBucketCmd = new DeleteBucketCommand({ Bucket: bucketName });
  await s3Client.send(delBucketCmd);
}