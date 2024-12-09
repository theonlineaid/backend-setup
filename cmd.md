# Setup command

The issue arises because your Prisma Client was generated for `debian-openssl-1.1.x`, but your deployment environment requires `debian-openssl-3.0.x`. Even though your local Ubuntu system uses OpenSSL 1.1.1, the Prisma engine checks the deployment environment's configuration.

### Steps to Fix
1. **Identify the correct OpenSSL version required**: 
   - Run your application in the target environment to check the OpenSSL version.
   - The error indicates `debian-openssl-3.0.x` is needed.

2. **Update your `schema.prisma`**:
   Add `debian-openssl-3.0.x` to the `binaryTargets` array:
   ```prisma
   generator client {
     provider        = "prisma-client-js"
     binaryTargets   = ["native", "debian-openssl-3.0.x"]
     or
     binaryTargets   = ["native", "rhel-openssl-3.0.x", "debian-openssl-3.0.x", "debian-openssl-1.1.x"]
   }
   ```

3. **Regenerate the Prisma Client**:
   Run:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init

   ```

4. **Deploy the updated Prisma Client** to your environment.

This ensures Prisma Client matches the deployment environment's OpenSSL version, resolving the compatibility issue. 

For Ubuntu users, even if your local version uses OpenSSL 1.1.x, deployment environments (e.g., Docker containers) may have OpenSSL 3.x, causing this mismatch. Always verify the target environment's settings.