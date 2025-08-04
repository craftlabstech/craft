# Profile Picture Upload with AWS S3

This implementation provides profile picture upload functionality for users who sign up with email (not OAuth providers like Google/GitHub).

## Features

- ✅ Automatic profile picture handling for OAuth users (Google, GitHub)
- ✅ Custom profile picture upload for email signup users
- ✅ S3 storage with optional CloudFront CDN support
- ✅ File validation (type, size)
- ✅ Automatic cleanup of old profile pictures
- ✅ Responsive UI component
- ✅ Integration with onboarding flow

## Setup Instructions

### 1. Install Dependencies

The required packages are already installed:

- `@aws-sdk/client-s3`
- `@aws-sdk/lib-storage`
- `multer` and `@types/multer`

### 2. AWS S3 Configuration

#### Create S3 Bucket

1. Go to AWS S3 Console
2. Create a new bucket (e.g., `your-app-profile-pictures`)
3. Choose your preferred region

#### Set Bucket Policy

Add this policy to allow public read access to profile pictures:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/profile-pictures/*"
    }
  ]
}
```

#### Set CORS Policy

Add this CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

#### Create IAM User

1. Create an IAM user with programmatic access
2. Attach the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/profile-pictures/*"
    }
  ]
}
```

### 3. Environment Variables

Add these variables to your `.env.local` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# Optional: CloudFront CDN URL (recommended for production)
AWS_CLOUDFRONT_URL=https://your-cloudfront-domain.cloudfront.net
```

### 4. Optional: CloudFront Setup (Recommended for Production)

1. Create a CloudFront distribution
2. Set the origin to your S3 bucket
3. Add the CloudFront URL to your environment variables
4. Update the Next.js config if needed

## Usage

### In Onboarding Flow

The profile picture upload is automatically included in the onboarding process:

- Email users see the profile picture upload step
- OAuth users (Google/GitHub) automatically skip this step

### In Settings Page

Users can manage their profile pictures at `/settings`:

- Upload new profile picture
- Delete current custom profile picture
- OAuth profile pictures cannot be deleted (managed by provider)

### Programmatic Usage

```tsx
import ProfilePictureUpload from "@/components/profile-picture-upload";

function MyComponent() {
  return (
    <ProfilePictureUpload
      onImageUpdate={(imageUrl) => {
        console.log("Profile picture updated:", imageUrl);
      }}
    />
  );
}
```

## API Endpoints

### POST `/api/user/profile-picture`

Upload a new profile picture

- Validates file type and size
- Uploads to S3
- Updates user record
- Deletes old custom profile picture

### DELETE `/api/user/profile-picture`

Delete current profile picture

- Only works for custom uploaded pictures
- OAuth provider images cannot be deleted

## File Structure

```
lib/
  s3.ts                           # S3 service utilities
components/
  profile-picture-upload.tsx      # React component
app/
  api/user/profile-picture/
    route.ts                      # API endpoints
  settings/
    page.tsx                      # Settings page
  onboarding/
    page.tsx                      # Updated onboarding
```

## Security Considerations

- Files are validated for type and size
- S3 bucket has restricted public access (only profile-pictures folder)
- IAM user has minimal required permissions
- Old files are automatically cleaned up
- File names are timestamped to prevent conflicts

## Limitations

- Maximum file size: 5MB
- Supported formats: JPEG, PNG, WebP
- Custom images only for email signup users
- OAuth users retain their provider images

## Troubleshooting

### Common Issues

1. **Images not loading**: Check Next.js `remotePatterns` configuration
2. **Upload fails**: Verify AWS credentials and S3 permissions
3. **CORS errors**: Ensure S3 CORS policy is correctly configured
4. **File size errors**: Check file size limits in component and AWS

### Debugging

Enable debug logging in the S3 service:

```typescript
console.log("Uploading to S3:", { key, contentType });
```

Monitor AWS CloudWatch logs for S3 access patterns and errors.
