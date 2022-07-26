# Elastic IPFS Event Delivery Lambda

## Deployment environment variables

_Variables in bold are required._

| Name                        | Default            | Description                                                                    |
| --------------------------- | ------------------ | ------------------------------------------------------------------------------ |
| AWS_ACCESS_KEY_ID           |                    | The AWS key ID. **This is also required as GitHub repository secret.**         |
| AWS_ACCOUNT_ID              |                    | The AWS account id. **This is only required as GitHub repository secret.**     |
| AWS_ECR_REPOSITORY          |                    | The AWS ECR repository. **This is only required as GitHub repository secret.** |
| AWS_REGION                  |                    | The AWS region. **This is also required as GitHub repository secret.**         |
| AWS_SECRET_ACCESS_KEY       |                    | The AWS access key. **This is also required as GitHub repository secret.**     |
| ENV_FILE_PATH               | `$PWD/.env`        | The environment file to load.                                                  |
| NODE_DEBUG                  |                    | If it contains `aws-ipfs`, debug mode is enabled.                              |
| NODE_ENV                    |                    | Set to `production` to disable pretty logging.                                 |

---
